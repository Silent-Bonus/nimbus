import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { router, useNavigation } from "expo-router";
import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/Themed";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ROUTES } from "@/constants/routes";

import RelaxMenIcon from "@/assets/images/logoNew/1.svg";

const LandingScreen = () => {
  const navigation = useNavigation();
  const { newTheme, tokens, svaTypography, spacing } = useContext(ThemeContext);

  const { width } = Dimensions.get("window");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const styles = styling(newTheme, tokens, svaTypography, spacing);

  const firstBtnSegmentBtnClick = () => {
    router.push(ROUTES.PUBLIC.REGISTER);
  };

  const secondBtnSegmentBtnClick = () => {
    router.push(ROUTES.PUBLIC.SIGN_IN);
  };

  return (
    <ScreenView>
      <View style={styles.container}>
        {/* Top Illustrations */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.imageContainer}>
            <RelaxMenIcon width={width * 0.8} height={width * 0.8} />
          </View>
        </View>

        {/* Hero / Tagline */}
        <Text style={styles.tagline}>
          🌩️ SVA — Your Everyday Growth Companion
        </Text>

        {/* Headline */}
        <Text style={styles.headline}>
          Stronger mind. Healthier body. Happier you.
        </Text>

        {/* Supporting text */}
        <Text style={styles.helper}>
          Track your growth, master your routines, and unlock the best version
          of yourself — one step at a time.
        </Text>

        <View style={{ marginTop: spacing.xl }} />

        {/* Buttons */}

        <NimbusButton
          label="I’m new to SVA"
          variant="primary"
          onPress={firstBtnSegmentBtnClick}
        />

        <Pressable onPress={secondBtnSegmentBtnClick}>
          <Text style={styles.secondaryButton}>I already have an account</Text>
        </Pressable>
      </View>
    </ScreenView>
  );
};

const styling = (newTheme: any, tokens: any, svaTypography: any, spacing: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: newTheme.background,
      justifyContent: "flex-start",
    },
    imageContainer: {
      borderRadius: tokens.radius.card,
      padding: spacing.md,
      backgroundColor: newTheme.background,
    },
    illustrationWrapper: {
      alignItems: "center",
    },
    helper: {
      ...svaTypography.textStyle.body,
      color: newTheme.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    secondaryButton: {
      ...svaTypography.textStyle.button,
      marginTop: spacing.md,
      color: newTheme.textPrimary,
      textAlign: "center",
    },
    tagline: {
      ...svaTypography.textStyle.caption,
      marginTop: spacing.xl,
      textAlign: "center",
      color: newTheme.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    headline: {
      ...svaTypography.textStyle.heading2,
      color: newTheme.textPrimary,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
  });

export default LandingScreen;
