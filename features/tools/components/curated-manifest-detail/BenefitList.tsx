import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

type BenefitListProps = {
  items: string[];
};

const BenefitList: React.FC<BenefitListProps> = ({ items }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={12} color={svaColors.brand.primary} />
          </View>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styling = (colors: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    list: {
      gap: spacing.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    iconWrap: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      backgroundColor: colors.brand.subtle,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.08)",
    },
    text: {
      ...svaTypography.textStyle.body,
      color: colors.text.primary,
      flex: 1,
    },
  });

export default BenefitList;
