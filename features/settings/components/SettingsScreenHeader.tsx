import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemeContext from "@/contexts/ThemeContext";

import { SETTINGS_LAYOUT } from "../settingsLayout";

type Props = {
  title?: string;
  onBack: () => void;
  onShare?: () => void;
};

export default function SettingsScreenHeader({
  title = "Nimbus You",
  onBack,
  onShare,
}: Props) {
  const { newTheme, svaTypography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const titleFamily =
    svaTypography?.textStyle.authTitle.fontFamily ??
    "CormorantGaramond_500Medium";

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }

    Share.share({
      message: "Nimbus",
      title: "Nimbus",
    }).catch(() => {});
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { backgroundColor: newTheme.pressed },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={21}
            color={newTheme.textPrimary}
          />
        </Pressable>

        <View style={styles.titleSlot}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                fontFamily: titleFamily,
                color: newTheme.textPrimary,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <Pressable
          onPress={handleShare}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { backgroundColor: newTheme.pressed },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Ionicons
            name="share-outline"
            size={19}
            color={newTheme.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SETTINGS_LAYOUT.screenHorizontal,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
