import { useContext, useMemo } from "react";

import ThemeContext from "@/contexts/ThemeContext";
import type { TypographyTokens } from "@/theme/types";

export type BodyVitalsTypography = {
  screenTitle: TypographyTokens["textStyle"]["heading2"];
  screenSubtitle: TypographyTokens["textStyle"]["body"];
  label: TypographyTokens["textStyle"]["authTinyLabel"];
  sectionLabel: TypographyTokens["textStyle"]["authTinyLabel"];
  sectionTitle: TypographyTokens["textStyle"]["title"];
  body: TypographyTokens["textStyle"]["body"];
  bodyMedium: TypographyTokens["textStyle"]["bodyMedium"];
  caption: TypographyTokens["textStyle"]["caption"];
  action: TypographyTokens["textStyle"]["button"];
  heroDisplay: TypographyTokens["textStyle"]["heading1"];
  heroDisplayLarge: TypographyTokens["textStyle"]["heading1"];
  numericValue: TypographyTokens["textStyle"]["heading2"];
};

export function resolveBodyVitalsTypography(
  svaTypography: any | undefined
): BodyVitalsTypography {
  const textStyle = svaTypography?.textStyle;

  return {
    screenTitle: textStyle?.authTitle ?? textStyle?.displayMedium ?? svaTypography.textStyle.heading2,
    screenSubtitle: textStyle?.authSubtitle ?? textStyle?.subtitle ?? svaTypography.textStyle.body,
    label: textStyle?.label ?? textStyle?.authTinyLabel ?? svaTypography.textStyle.authTinyLabel,
    sectionLabel: textStyle?.authTinyLabel ?? svaTypography.textStyle.authTinyLabel,
    sectionTitle: textStyle?.heading2 ?? textStyle?.title ?? svaTypography.textStyle.title,
    body: textStyle?.body ?? svaTypography.textStyle.body,
    bodyMedium: textStyle?.bodyMedium ?? textStyle?.title ?? svaTypography.textStyle.bodyMedium,
    caption: textStyle?.caption ?? textStyle?.authFootnote ?? svaTypography.textStyle.caption,
    action: textStyle?.authActionLabel ?? textStyle?.button ?? svaTypography.textStyle.button,
    heroDisplay: textStyle?.displayMedium ?? textStyle?.authTitle ?? svaTypography.textStyle.heading1,
    heroDisplayLarge:
      textStyle?.displayLarge ?? textStyle?.displayMedium ?? svaTypography.textStyle.heading1,
    numericValue: textStyle?.authTitle ?? svaTypography.textStyle.heading2,
  };
}

export function useBodyVitalsTheme() {
  const { newTheme, spacing, svaTypography } =
    useContext(ThemeContext);
  const bodyVitalsTypography = useMemo(
    () => resolveBodyVitalsTypography(svaTypography),
    [svaTypography]
  );

  return {
    newTheme,
    spacing,
    bodyVitalsTypography,
  };
}
