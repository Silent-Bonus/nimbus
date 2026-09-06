import { useContext, useMemo } from "react";

import ThemeContext from "@/contexts/ThemeContext";
import type { Typography, TypographyTokens } from "@/theme/types";

export type BodyVitalsTypography = {
  screenTitle: Typography["h2"];
  screenSubtitle: Typography["body"];
  label: Typography["smallCaption"];
  sectionLabel: Typography["smallCaption"];
  sectionTitle: Typography["h3"];
  body: Typography["body"];
  bodyMedium: Typography["bodyStrong"];
  caption: Typography["caption"];
  action: Typography["button"];
  heroDisplay: Typography["h1"];
  heroDisplayLarge: Typography["h1"];
  numericValue: Typography["h2"];
};

export function resolveBodyVitalsTypography(
  svaTypography: TypographyTokens | undefined,
  typography: Typography
): BodyVitalsTypography {
  // Prefer the standardized SVA token set. The legacy typography object stays
  // only as a defensive fallback until every app surface is fully migrated.
  const textStyle = svaTypography?.textStyle;

  return {
    screenTitle: textStyle?.authTitle ?? textStyle?.displayMedium ?? typography.h2,
    screenSubtitle: textStyle?.authSubtitle ?? textStyle?.subtitle ?? typography.body,
    label: textStyle?.label ?? textStyle?.authTinyLabel ?? typography.smallCaption,
    sectionLabel: textStyle?.authTinyLabel ?? typography.smallCaption,
    sectionTitle: textStyle?.heading2 ?? textStyle?.title ?? typography.h3,
    body: textStyle?.body ?? typography.body,
    bodyMedium: textStyle?.bodyMedium ?? textStyle?.title ?? typography.bodyStrong,
    caption: textStyle?.caption ?? textStyle?.authFootnote ?? typography.caption,
    action: textStyle?.authActionLabel ?? textStyle?.button ?? typography.button,
    heroDisplay: textStyle?.displayMedium ?? textStyle?.authTitle ?? typography.h1,
    heroDisplayLarge:
      textStyle?.displayLarge ?? textStyle?.displayMedium ?? typography.h1,
    numericValue: textStyle?.authTitle ?? typography.h2,
  };
}

export function useBodyVitalsTheme() {
  const { newTheme, spacing, typography, svaTypography } =
    useContext(ThemeContext);
  const bodyVitalsTypography = useMemo(
    () => resolveBodyVitalsTypography(svaTypography, typography),
    [svaTypography, typography]
  );

  return {
    newTheme,
    spacing,
    bodyVitalsTypography,
  };
}
