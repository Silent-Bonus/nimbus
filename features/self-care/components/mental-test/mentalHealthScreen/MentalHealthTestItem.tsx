// components/selfCare/mentalTest/MentalHealthTestItem.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";

export type MentalTest = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  description?: string;
  estTimeMinutes?: number;
  questionsCount?: number;
};

type Props = {
  item: MentalTest;
  onPress: () => void;
};

const MentalHealthTestItem: React.FC<Props> = ({ item, onPress }) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const metaParts: string[] = [];
  if (item.estTimeMinutes) metaParts.push(`${item.estTimeMinutes} min`);
  if (item.questionsCount) metaParts.push(`${item.questionsCount} questions`);

  const metaText = metaParts.join(" • ");

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Image source={item.image} style={styles.thumb} />

      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        {metaText ? <Text style={styles.meta}>{metaText}</Text> : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={newTheme.textSecondary}
      />
    </TouchableOpacity>
  );
};

export default MentalHealthTestItem;

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surfaceMuted,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 18,
      marginRight: spacing.md,
    },
    textCol: {
      flex: 1,
    },
    title: {
      ...svaTypography.textStyle.body,
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: 2,
    },
    description: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    meta: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      opacity: 0.9,
    },
  });
