import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemeContext from "@/contexts/ThemeContext";

import { SETTINGS_LAYOUT } from "../settingsLayout";

type Props = {
  title?: string;
};

export default function SettingsScreenHeader({ title = "Nimbus You" }: Props) {
  const { newTheme, svaTypography } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const titleFamily =
    svaTypography.fontFamily.display;

  return (
    <View
      style={[styles.wrapper, { paddingTop: insets.top + 6 }]}
    >
      <View style={styles.row}>
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
