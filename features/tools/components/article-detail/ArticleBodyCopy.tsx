import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import type { Spacing, SvaColorSet, TypographyTokens } from "@/theme/types";

type ArticleBodyCopyProps = {
  paragraphs: string[];
  dropCapFirst?: boolean;
};

const ArticleBodyCopy: React.FC<ArticleBodyCopyProps> = ({
  paragraphs,
  dropCapFirst = true,
}) => {
  const { svaColors, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(svaColors, spacing, svaTypography);

  return (
    <View style={styles.wrap}>
      {paragraphs.map((paragraph, index) => {
        const shouldDropCap = dropCapFirst && index === 0;
        const firstLetter = paragraph.slice(0, 1);
        const remaining = paragraph.slice(1);

        return (
          <Text key={`${index}-${paragraph.slice(0, 8)}`} style={styles.paragraph}>
            {shouldDropCap ? (
              <>
                <Text style={styles.dropCap}>{firstLetter}</Text>
                {remaining}
              </>
            ) : (
              paragraph
            )}
          </Text>
        );
      })}
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
      gap: spacing.md,
    },
    paragraph: {
      fontFamily: typography?.textStyle?.authBody?.fontFamily ?? "Outfit_400Regular",
      color: colors.text.secondary,
      fontSize: 15,
      lineHeight: 28,
      letterSpacing: 0.1,
    },
    dropCap: {
      fontFamily:
        typography?.textStyle?.authTitle?.fontFamily ??
        "CormorantGaramond_600SemiBold",
      fontSize: 52,
      lineHeight: 54,
      color: colors.brand.primary,
    },
  });

export default ArticleBodyCopy;
