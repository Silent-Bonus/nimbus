import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";

type StatItem = {
  label: string;
  value: string;
  hint?: string;
};

type ManifestStatGridProps = {
  items: StatItem[];
};

const ManifestStatGrid: React.FC<ManifestStatGridProps> = ({ items }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.row}>
      {items.slice(0, 3).map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label.toUpperCase()}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {item.value}
          </Text>
          {!!item.hint && <Text style={styles.hint}>{item.hint}</Text>}
        </View>
      ))}
    </View>
  );
};

const styling = (colors: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    card: {
      flex: 1,
      minHeight: 96,
      borderRadius: 18,
      padding: spacing.md,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    label: {
      ...svaTypography.textStyle.authTinyLabel,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.2,
      marginBottom: 10,
    },
    value: {
      fontFamily: SVATypography.fontFamily.displayStrong,
      fontSize: 19,
      lineHeight: 22,
      color: colors.text.primary,
    },
    hint: {
      ...svaTypography.textStyle.caption,
      color: colors.text.secondary,
      marginTop: 4,
    },
  });

export default ManifestStatGrid;
