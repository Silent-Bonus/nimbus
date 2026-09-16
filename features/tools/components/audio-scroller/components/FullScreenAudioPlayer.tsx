import React, { useEffect, useState, useRef, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import ThemeContext from "@/contexts/ThemeContext";

export interface AudiobookData {
  id: string;
  title: string;
  coach_name: string;
  coverImageUrl: string;
  audioUrl: string;
  duration: string;
}

// --- HELPER FUNCTION ---
const formatTime = (millis: number | undefined) => {
  if (millis === undefined) return "00:00";
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

interface FullScreenAudioPlayerProps {
  visible: boolean;
  audiobook: AudiobookData | null;
  onClose: () => void;
}

const FullScreenAudioPlayer: React.FC<FullScreenAudioPlayerProps> = ({
  visible,
  audiobook,
  onClose,
}) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const isPlaying = playbackStatus?.isLoaded && playbackStatus.isPlaying;
  const positionMillis = playbackStatus?.isLoaded
    ? playbackStatus.positionMillis
    : 0;
  const durationMillis =
    playbackStatus?.isLoaded && playbackStatus.durationMillis
      ? playbackStatus.durationMillis
      : 1;

  useEffect(() => {
    const loadSound = async () => {
      if (visible && audiobook) {
        setIsLoading(true);
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audiobook.audioUrl },
            { shouldPlay: true },
            (status) => setPlaybackStatus(status)
          );
          soundRef.current = sound;
        } catch (error) {
          console.error("Error loading audio:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [visible, audiobook]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const handleSeek = async (forward: boolean) => {
    if (!soundRef.current || !playbackStatus?.isLoaded) return;
    const delta = 15000;
    let newPosition = positionMillis + (forward ? delta : -delta);
    newPosition = Math.max(0, Math.min(newPosition, durationMillis - 500));
    await soundRef.current.setPositionAsync(newPosition);
  };

  const onSliderValueChange = async (value: number) => {
    if (!soundRef.current || !playbackStatus?.isLoaded) return;
    const newPosition = value * durationMillis;
    if (Math.abs(newPosition - positionMillis) > 800) {
      await soundRef.current.setPositionAsync(newPosition);
    }
  };

  const handleClose = () => {
    soundRef.current?.pauseAsync();
    onClose();
  };

  const title = audiobook?.title ?? "";
  const author = audiobook?.coach_name || "Unknown Author";
  const cover = audiobook?.coverImageUrl;

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <ImageBackground
        source={cover ? { uri: cover } : undefined}
        style={styles.container}
        blurRadius={22}
        resizeMode="cover"
      >
        {/* dark vignette over background */}
        <View style={styles.backgroundOverlay} />

        {/* top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={20} color={newTheme.background} />
          </TouchableOpacity>

          <Text style={styles.topTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* main glass card */}
        <View style={styles.card}>
          {/* cover art */}
          {cover ? (
            <ImageBackground
              source={{ uri: cover }}
              style={styles.coverArt}
              imageStyle={styles.coverArtImage}
            />
          ) : null}

          {/* title + author */}
          <View style={styles.metaBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {author}
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={newTheme.accent}
              style={{ marginTop: spacing.lg }}
            />
          ) : (
            <>
              {/* slider */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={positionMillis / durationMillis}
                minimumTrackTintColor={newTheme.accent}
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor={newTheme.accent}
                onSlidingComplete={onSliderValueChange}
              />

              {/* time labels */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(positionMillis)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(durationMillis)}
                </Text>
              </View>

              {/* controls */}
              <View style={styles.controlsPill}>
                <TouchableOpacity
                  onPress={() => handleSeek(false)}
                  style={styles.smallControl}
                >
                  <Ionicons
                    name="play-back"
                    size={22}
                    color={newTheme.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePlayPause}
                  style={styles.playButton}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={30}
                    color={newTheme.background}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSeek(true)}
                  style={styles.smallControl}
                >
                  <Ionicons
                    name="play-forward"
                    size={22}
                    color={newTheme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ImageBackground>
    </Modal>
  );
};

export default FullScreenAudioPlayer;

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: newTheme.background,
    },
    backgroundOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
    },

    // TOP BAR
    topBar: {
      position: "absolute",
      top: Platform.OS === "ios" ? 50 : 30,
      left: spacing.md,
      right: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.95)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    topTitle: {
      ...svaTypography.textStyle.caption,
      flex: 1,
      color: "rgba(255,255,255,0.9)",
      fontWeight: "600",
    },

    // MAIN CARD
    card: {
      width: "88%",
      borderRadius: 26,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      backgroundColor: "rgba(15,15,15,0.9)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.06)",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.45,
          shadowRadius: 24,
        },
        android: {
          elevation: 12,
        },
      }),
    },

    coverArt: {
      width: 260,
      height: 260,
      marginBottom: spacing.lg,
    },
    coverArtImage: {
      borderRadius: 22,
    },

    metaBlock: {
      alignItems: "center",
      marginBottom: spacing.md,
    },
    title: {
      ...svaTypography.textStyle.authLabel,
      textAlign: "center",
      color: "#FFFFFF",
      fontWeight: "700",
      marginBottom: 4,
    },
    author: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.75)",
    },

    slider: {
      width: "100%",
      height: 36,
      marginTop: spacing.md,
    },
    timeContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 2,
      marginTop: 4,
    },
    timeText: {
      ...svaTypography.textStyle.caption,
      color: "rgba(255,255,255,0.7)",
      fontSize: 12,
    },

    // CONTROLS
    controlsPill: {
      marginTop: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.12)",
      minWidth: 220,
    },
    smallControl: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: newTheme.accent,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: spacing.sm,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
