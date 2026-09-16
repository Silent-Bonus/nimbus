// src/components/shorts/VideoScroller.tsx

import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import VideoScrollerSkeleton from "./components/ VideoScrollerSkeleton";
import FullScreenVideoPlayer from "./components/FullScreenVideoPlayer";
import VideoThumbnail from "./components/videoThumbnail";

import { getShortVideo } from "@/features/tools/services/toolService";

import ThemeContext from "@/contexts/ThemeContext";
// ⬅️ NEW import

export interface VideoData {
  id: number;
  title: string;
  image: string;
  category?: string;
  source: string;
  views?: string;
}

const VideoScroller: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlayerVisible, setPlayerVisible] = useState(false);

  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  useEffect(() => {
    const loadVideos = async () => {
      const views = ["800K+ views", "100K+ views", "900K+ views", "1M+ views"];

      try {
        const result = await getShortVideo();
        if (result && Array.isArray(result)) {
          const processedVideo = result.map((item: any) => {
            const randomTag = views[Math.floor(Math.random() * views.length)];
            return {
              ...item,
              views: randomTag,
            };
          });
          setVideos(processedVideo);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleThumbnailPress = (video: VideoData) => {
    setSelectedVideo(video);
    setPlayerVisible(true);
  };

  const handleClosePlayer = () => {
    setPlayerVisible(false);
    setSelectedVideo(null);
  };

  if (loading) {
    // ⬅️ use Nimbus skeleton instead of spinner
    return <VideoScrollerSkeleton />;
  }

  if (!videos.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To be Organized</Text>

      <FlatList
        data={videos}
        renderItem={({ item }) => (
          <VideoThumbnail
            video={item}
            onPress={() => handleThumbnailPress(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />

      <FullScreenVideoPlayer
        visible={isPlayerVisible}
        video={selectedVideo}
        onClose={handleClosePlayer}
      />
    </View>
  );
};

export default VideoScroller;

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
