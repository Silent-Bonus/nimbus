import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import React, { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import ThemeContext from "@/contexts/ThemeContext";

import { TrackType } from "@/features/self-care/types/trackTypes";

interface PropType {
  backgroundColor: string; // now treated as optional tint / fallback
  title: string;
  description: string;
  itemList: any[];
  noOfRows?: number;
  onClickOfAll: () => void;
}

const HorizontalListCardScroll: React.FC<PropType> = (props) => {
  const {
    backgroundColor,
    title,
    description,
    onClickOfAll,
    itemList,
    noOfRows,
  } = props;

  const [currentTrack, setCurrentTrack] = useState<TrackType | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Split data into rows of N items each
  const chunkedData: any[] = [];
  const rowCount = noOfRows || 3;
  for (let i = 0; i < itemList.length; i += rowCount) {
    chunkedData.push(itemList.slice(i, i + rowCount));
  }

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  // compute section-specific background variations
  const { outerBg, innerBg } = getVariantColors(
    title,
    newTheme,
    backgroundColor
  );

  const styles = styling(newTheme, spacing, svaTypography);

  const handleItemClick = (title: string, entry: any) => {
    const lowerTitle = title.toLowerCase();
    if (
      lowerTitle.includes("atmosphere") ||
      lowerTitle.includes("zen") ||
      lowerTitle.includes("soundscape") ||
      lowerTitle.includes("meditation")
    ) {
      handlePlayPause(entry);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.warn("Failed to stop audio", e);
    } finally {
      setSound(null);
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async (track: any) => {
    try {
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          await sound?.pauseAsync();
        } else {
          await sound?.playAsync();
        }
        setIsPlaying(!isPlaying);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        typeof track.source === "string" ? { uri: track.source } : track.source
      );
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // const onCloseModal = async () => {
  //   if (isPlaying) {
  //     await sound?.pauseAsync();
  //   }
  //   setCurrentTrack(null);
  // };

  const onCloseModal = async () => {
    await stopAudio();
  };

  return (
    <View style={[styles.card, { backgroundColor: outerBg }]}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity
          onPress={async () => {
            await stopAudio();
            onClickOfAll();
          }}
        >
          <Text style={styles.allButton}>All ›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDescription}>{description}</Text>

      <FlatList
        data={chunkedData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.rowContainer, { backgroundColor: innerBg }]}>
            {item.map((entry: any) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleItemClick(title, entry)}
              >
                <View style={styles.itemRow}>
                  <Image
                    source={
                      typeof entry.image === "string"
                        ? { uri: entry.image }
                        : entry.image
                    }
                    style={styles.itemImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {entry.name || entry.title}
                    </Text>
                    {(!!entry.duration || !!entry.durationLabel) && (
                      <Text style={styles.itemDuration}>
                        {entry.durationLabel || `${entry.duration || "3"} min`}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Bottom Player */}
      {currentTrack && (
        <View
          style={[
            styles.bottomPlayer,
            { backgroundColor: newTheme.cardRaised },
          ]}
        >
          <Image
            source={
              typeof currentTrack.image === "string"
                ? { uri: currentTrack.image }
                : currentTrack.image
            }
            style={styles.playerImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.playerText}>
            <Text style={styles.playerTitle}>
              {currentTrack.name || currentTrack.title}
            </Text>
            <Text style={styles.playerDuration}>
              {currentTrack.durationLabel ||
                `${currentTrack.duration || "3"} min`}{" "}
              · {title}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handlePlayPause(currentTrack)}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={22}
              color={newTheme.accent}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCloseModal} style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={20} color={newTheme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HorizontalListCardScroll;

// section-specific background variations
const getVariantColors = (
  title: string,
  newTheme: any,
  fallback: string
): { outerBg: string; innerBg: string } => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("atmosphere") || lowerTitle.includes("soundscape")) {
    return {
      outerBg: newTheme.cardRaised,
      innerBg: newTheme.surfaceMuted,
    };
  }

  if (lowerTitle.includes("zen") || lowerTitle.includes("meditation")) {
    return {
      outerBg: "#26262F", // subtle indigo tint
      innerBg: "#2F3038",
    };
  }

  if (lowerTitle.includes("medical") || lowerTitle.includes("assessment")) {
    return {
      outerBg: "#262B30", // soft blue-grey
      innerBg: "#30343A",
    };
  }

  return {
    outerBg: newTheme.cardRaised || fallback,
    innerBg: newTheme.surfaceMuted,
  };
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    card: {
      marginVertical: spacing.lg,
      borderRadius: 20,
      padding: spacing.lg,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    cardTitle: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
    },
    cardDescription: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginBottom: spacing.md,
    },
    allButton: {
      ...svaTypography.textStyle.body,
      color: newTheme.accent,
      fontWeight: "600",
    },
    rowContainer: {
      flexDirection: "column",
      justifyContent: "space-between",
      borderRadius: 16,
      marginRight: spacing.md,
      overflow: "hidden",
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 260,
      borderBottomWidth: 1,
      borderBottomColor: newTheme.borderMuted,
    },
    itemInfo: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    itemImage: {
      width: 70,
      height: 70,
      borderRadius: 12,
      marginLeft: spacing.sm,
    },
    itemTitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      marginBottom: 4,
    },
    itemDuration: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
    },
    bottomPlayer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    playerImage: {
      width: 44,
      height: 44,
      borderRadius: 10,
    },
    playerText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    playerTitle: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "600",
    },
    playerDuration: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
    },
  });
