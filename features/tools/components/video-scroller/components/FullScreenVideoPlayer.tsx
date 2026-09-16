import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Text,
  Platform,
} from "react-native";
import {
  VideoView,
  useVideoPlayer,
  PlayingChangeEventPayload,
} from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import { VideoData } from "../VideoScroller"; // adjust path if needed

interface FullScreenVideoPlayerProps {
  visible: boolean;
  video: VideoData | null;
  onClose: () => void;
}

const FullScreenVideoPlayer: React.FC<FullScreenVideoPlayerProps> = ({
  visible,
  video,
  onClose,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const player = useVideoPlayer(video ? video.source : "", () => {
    // we'll control play manually via the button
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (visible && video) {
      // reset state, show loader
      setIsPlaying(false);
      setIsReady(false);
      player.replace(video.source);

      // naive but reliable: assume it becomes ready shortly after replacing
      // (expo-video currently doesn't expose a `canPlay` event in types)
      const readyTimeout = setTimeout(() => {
        setIsReady(true);
      }, 400);

      return () => clearTimeout(readyTimeout);
    } else {
      player.replace(null);
      setIsPlaying(false);
      setIsReady(false);
    }
  }, [visible, video, player]);

  useEffect(() => {
    const playingSub = player.addListener(
      "playingChange",
      (event: PlayingChangeEventPayload) => {
        setIsPlaying(event.isPlaying);
      }
    );

    return () => {
      playingSub.remove();
    };
  }, [player]);

  const handleTogglePlay = () => {
    if (!isReady) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleClose = () => {
    player.pause();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          allowsFullscreen={false}
        />

        {/* Loading indicator */}
        {!isReady && (
          <ActivityIndicator
            size="large"
            color={newTheme.accent}
            style={styles.loadingIndicator}
          />
        )}

        {/* Top overlay: close + title */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color={newTheme.background} />
          </TouchableOpacity>

          {video?.title ? (
            <Text style={styles.titleText} numberOfLines={1}>
              {video.title}
            </Text>
          ) : null}
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <View style={styles.controlsPill}>
            <TouchableOpacity
              onPress={() => isReady && player.seekBy(-10)}
              style={styles.smallControl}
            >
              <Ionicons
                name="play-back"
                size={22}
                color={newTheme.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTogglePlay}
              style={styles.playButton}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color={newTheme.background}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => isReady && player.seekBy(10)}
              style={styles.smallControl}
            >
              <Ionicons
                name="play-forward"
                size={22}
                color={newTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FullScreenVideoPlayer;

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "black",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingIndicator: {
      position: "absolute",
      alignSelf: "center",
    },
    // TOP BAR
    topBar: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 32,
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
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    titleText: {
      ...svaTypography.textStyle.caption,
      flex: 1,
      color: "rgba(255,255,255,0.9)",
      fontWeight: "600",
    },
    // BOTTOM CONTROLS
    bottomBar: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 40 : 24,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    controlsPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.55)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.12)",
      minWidth: 220,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    smallControl: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: newTheme.accent,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: spacing.sm,
    },
  });
