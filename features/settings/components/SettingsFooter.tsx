import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import ThemeContext from "@/contexts/ThemeContext";

type Props = {
  label?: string;
};

export default function SettingsFooter({
  label = "SVA V2.4.0 PREMIUM",
}: Props) {
  const { newTheme, svaTypography } = useContext(ThemeContext);
  const monoFamily =
    svaTypography?.textStyle.authMonoLabel.fontFamily ?? "SpaceMono-Regular";

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.text,
          {
            fontFamily: monoFamily,
            color: newTheme.textDisabled,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 8,
  },
  text: {
    fontSize: 10,
    letterSpacing: 2.6,
    textAlign: "center",
  },
});
