import type { Typography, TypographyTokens } from "@/theme/types";

export function resolveBodyVitalsTypography(
  svaTypography: TypographyTokens | undefined,
  typography: Typography
) {
  const textStyle = svaTypography?.textStyle;

  return {
    screenTitle: textStyle?.authTitle ?? typography.h2,
    screenSubtitle: textStyle?.authSubtitle ?? typography.body,
    sectionLabel: textStyle?.authTinyLabel ?? typography.smallCaption,
    sectionTitle: textStyle?.heading2 ?? typography.h3,
    body: textStyle?.body ?? typography.body,
    bodyMedium: textStyle?.bodyMedium ?? typography.bodyStrong,
    caption: textStyle?.caption ?? typography.caption,
    action: textStyle?.authActionLabel ?? typography.button,
    heroDisplay: textStyle?.displayMedium ?? typography.h1,
    heroDisplayLarge: textStyle?.displayLarge ?? typography.h1,
    numericValue: textStyle?.authTitle ?? typography.h2,
  };
}
