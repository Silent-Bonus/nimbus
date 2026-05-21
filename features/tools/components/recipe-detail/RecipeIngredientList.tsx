import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type RecipeIngredientListProps = {
  items: string[];
};

const RecipeIngredientList: React.FC<RecipeIngredientListProps> = ({ items }) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle-outline" size={16} color={svaColors.brand.primary} />
          </View>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styling = (
  colors: SvaColorSet,
  spacing: Spacing,
  typography?: TypographyTokens
) =>
  StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    iconWrap: {
      marginTop: 2,
    },
    text: {
      flex: 1,
      ...typography?.textStyle?.authBody,
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 22,
    },
  });

export default RecipeIngredientList;
