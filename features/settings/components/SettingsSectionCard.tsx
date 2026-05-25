import React, { useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  title: string;
  icon: IconName;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SettingsSectionCard({
  title,
  icon,
  children,
  style,
}: Props) {
  const { newTheme, svaTypography, typography } = useContext(ThemeContext);
  const headerFamily =
    svaTypography?.textStyle.authActionLabel.fontFamily ??
    typography.button.fontFamily ??
    "Outfit_600SemiBold";

  return (
    <View
      style={[styles.shell, { shadowColor: newTheme.shadow }, style]}
    >
      <LinearGradient
        colors={[newTheme.card, newTheme.cardRaised]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: newTheme.borderMuted,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name={icon}
            size={12}
            color={newTheme.textSecondary}
            style={styles.headerIcon}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.headerTitle,
              {
                fontFamily: headerFamily,
                color: newTheme.textSecondary,
              },
            ]}
          >
            {title.toUpperCase()}
          </Text>
        </View>

        <View style={styles.body}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 22,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcon: {
    marginRight: 8,
    opacity: 0.95,
  },
  headerTitle: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  body: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
});
