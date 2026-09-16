// src/components/audiobooks/AudiobookScroller.tsx

import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import { getAudioBookList } from "@/features/tools/services/toolService";
import AudiobookThumbnail from "./components/AudiobookThumbnail";
import FullScreenAudioPlayer from "./components/FullScreenAudioPlayer";
import ThemeContext from "@/contexts/ThemeContext";
import AudiobookScrollerSkeleton from "./components/AudiobookScrollerSkeleton";

export interface AudiobookData {
  id: string;
  title: string;
  coach_name: string;
  coverImageUrl: string;
  audioUrl: string;
  duration: string;
}

const AudiobookScroller: React.FC = () => {
  const [audiobooks, setAudiobooks] = useState<AudiobookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudiobook, setSelectedAudiobook] =
    useState<AudiobookData | null>(null);
  const [isPlayerVisible, setPlayerVisible] = useState(false);

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  useEffect(() => {
    const loadAudiobooks = async () => {
      try {
        const result = await getAudioBookList();

        if (result && Array.isArray(result)) {
          const processedAudiobooks: AudiobookData[] = result.map(
            (item: any) => ({
              id: item.id.toString(),
              title: item.title,
              coach_name: "Unknown Author",
              coverImageUrl: item.image,
              audioUrl: item.source,
              duration: `${item.duration}m`,
            })
          );

          setAudiobooks(processedAudiobooks);
        }
      } catch (error) {
        console.error("Failed to fetch audiobooks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAudiobooks();
  }, []);

  const handleThumbnailPress = (audiobook: AudiobookData) => {
    setSelectedAudiobook(audiobook);
    setPlayerVisible(true);
  };

  const handleClosePlayer = () => {
    setPlayerVisible(false);
    setSelectedAudiobook(null);
  };

  if (loading) {
    return <AudiobookScrollerSkeleton />;
  }

  if (!audiobooks.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Listen Again</Text>

      <FlatList
        data={audiobooks}
        renderItem={({ item }) => (
          <AudiobookThumbnail
            audiobook={item}
            onPress={() => handleThumbnailPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />

      <FullScreenAudioPlayer
        visible={isPlayerVisible}
        audiobook={selectedAudiobook}
        onClose={handleClosePlayer}
      />
    </View>
  );
};

export default AudiobookScroller;

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing.lg,
    },
    header: {
      ...svaTypography.textStyle.title,
      color: newTheme.textPrimary,
      marginBottom: spacing.md,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    listContentContainer: {
      paddingRight: spacing.md,
    },
  });
