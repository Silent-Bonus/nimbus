// src/components/tools/common/ComingSoonFeatureScreen.tsx

import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// <<<<<<< HEAD:features/tools/components/common/ComingSoonFeatureScreen.tsx
import ThemeContext from "@/contexts/ThemeContext";
import ToolScreenHeader from "@/features/tools/components/common/ToolScreenHeader";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import AppHeader from "@/components/layout/AppHeader";
// =======
// import AppHeader from "@/components/common/AppHeader";
// >>>>>>> 0903e1c (tool screen header replaced by app header):components/tools/common/ComingSoonFeatureScreen.tsx

export type ComingSoonConfig = {
  emoji?: string; // optional emoji before title
  icon?: string; // center icon inside hero tile (defaults to ☁️)

  title: string;
  subtitle: string;

  badgeLabel?: string; // e.g. “Early access soon”
  description: string;
  benefits?: string[];

  primaryCtaLabel: string;
  onPrimaryPress: () => void;

  secondaryCtaLabel?: string;
  onSecondaryPress?: () => void;

  footnote?: string;
};

interface ComingSoonFeatureScreenProps {
  onBack: () => void;
  config: ComingSoonConfig;
}

const ComingSoonFeatureScreen: React.FC<ComingSoonFeatureScreenProps> = ({
  onBack,
  config,
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const titleWithEmoji = config.title;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header – same visual language as Routine / Recipe / Article */}
        <AppHeader
          title={titleWithEmoji}
          subtitle={config.subtitle}
          onBack={onBack}
        />

        {/* Badge */}
        {config.badgeLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {config.badgeLabel.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Hero nested card */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroLayerOuter}>
            <View style={styles.heroLayerMiddle}>
              <View style={styles.heroLayerInner}>
                <View style={styles.heroIconBubble}>
                  <Text style={styles.heroIcon}>{config.icon || "☁️"}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{config.description}</Text>

        {/* Benefits */}
        {config.benefits && config.benefits.length > 0 && (
          <View style={styles.benefitsBlock}>
            {config.benefits.map((line, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.benefitText}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTAs */}
        <View style={styles.ctaRow}>
          <View style={{ flex: 1 }}>
            <StyledButton
              label={config.primaryCtaLabel}
              variant="primary"
              fullWidth
              onPress={config.onPrimaryPress}
            />
          </View>

          {config.secondaryCtaLabel && config.onSecondaryPress && (
            <StyledButton
              label={config.secondaryCtaLabel}
              variant="ghost"
              onPress={config.onSecondaryPress}
              style={styles.secondaryButton}
            />
          )}
        </View>

        {/* Footnote */}
        {config.footnote && (
          <Text style={styles.footnote}>{config.footnote}</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      paddingTop: spacing.md,
      backgroundColor: theme.background, // ensure Nimbus dark bg
    },
    scrollContent: {
      paddingBottom: spacing.xl * 2,
    },

    // Badge
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs * 0.7,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted ?? "#1E221E",
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    badgeText: {
      ...svaTypography.textStyle.caption,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: theme.textSecondary,
    },

    // Hero nested card
    heroWrapper: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    heroLayerOuter: {
      width: "100%",
      aspectRatio: 1.5,
      borderRadius: 32,
      backgroundColor: theme.surfaceMuted ?? "#181C18",
      alignItems: "center",
      justifyContent: "center",
    },
    heroLayerMiddle: {
      width: "78%",
      height: "78%",
      borderRadius: 28,
      backgroundColor: theme.surface ?? "#141814",
      alignItems: "center",
      justifyContent: "center",
    },
    heroLayerInner: {
      width: "62%",
      height: "62%",
      borderRadius: 24,
      backgroundColor: theme.surfaceElevated ?? "#101310",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.shadow,
      shadowOpacity: 0.22,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 10,
    },
    heroIconBubble: {
      width: 88,
      height: 88,
      borderRadius: 24,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    heroIcon: {
      fontSize: 40,
    },

    // Text blocks
    description: {
      ...svaTypography.textStyle.body,
      color: theme.textPrimary,
      marginBottom: spacing.md,
    },
    benefitsBlock: {
      marginBottom: spacing.lg,
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.xs,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginTop: spacing.xs * 0.9,
      marginRight: spacing.sm,
    },
    benefitText: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      flex: 1,
    },

    // CTAs
    ctaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
    secondaryButton: {
      marginLeft: spacing.md,
    },

    // Footnote
    footnote: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: spacing.sm,
    },
  });

export default ComingSoonFeatureScreen;
