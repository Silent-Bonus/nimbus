import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

export interface BottomPlayerProps {
  title: string;
  subtitle?: string; // e.g. "3 min · Soundscape"
  image: ImageSourcePropType;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

const BottomPlayer: React.FC<BottomPlayerProps> = ({
  title,
  subtitle,
  image,
  isPlaying,
  onPlayPause,
  onClose,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Image source={image} style={styles.image} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onPlayPause}
            style={styles.playButton}
            activeOpacity={0.9}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color={newTheme.buttonPrimaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={18} color={newTheme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styling = (newTheme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: Platform.OS === "ios" ? spacing.lg : spacing.md,
      alignItems: "center",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: newTheme.surfaceMuted,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 16,
      width: width - spacing.md * 2,
      borderWidth: 1,
      borderColor: newTheme.borderMuted,
      shadowColor: newTheme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    image: {
      width: 40,
      height: 40,
      borderRadius: 12,
    },
    textContainer: {
      flex: 1,
      marginLeft: spacing.sm,
      marginRight: spacing.xs,
    },
    title: {
      ...svaTypography.textStyle.body,
      color: newTheme.textPrimary,
      fontWeight: "600",
    },
    subtitle: {
      ...svaTypography.textStyle.caption,
      color: newTheme.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
    },
    playButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: newTheme.buttonPrimary,
      marginRight: spacing.xs,
    },
    closeButton: {
      padding: spacing.xs,
    },
  });

export default BottomPlayer;
