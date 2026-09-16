import { TypographyTokens } from "./types";

const svaFontFamily = {
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodyStrong: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
  display: "CormorantGaramond_500Medium",
  displayStrong: "CormorantGaramond_600SemiBold",
  mono: "SpaceMono-Regular",
} as const;

export const SVATypography: TypographyTokens = {
  fontFamily: svaFontFamily,

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    displaySm: 32,
    displayMd: 48,
    displayLg: 64,
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  lineHeight: {
    xs: 1.2 * 12,
    sm: 1.4 * 14,
    md: 1.5 * 16,
    lg: 1.5 * 18,
    xl: 1.4 * 20,
    xxl: 1.3 * 24,
    displaySm: 1.2 * 32,
    displayMd: 1.1 * 48,
    displayLg: 1.05 * 64,
  },

  letterSpacing: {
    tighter: -0.02,
    tight: -0.01,
    normal: 0,
    wide: 0.02,
    wider: 0.04,
  },

  textStyle: {
    displayLarge: {
      fontFamily: svaFontFamily.display,
      fontSize: 64,
      fontWeight: "500",
      lineHeight: 1.05 * 64,
      letterSpacing: -0.02 * 64,
    },

    displayMedium: {
      fontFamily: svaFontFamily.display,
      fontSize: 48,
      fontWeight: "500",
      lineHeight: 1.1 * 48,
      letterSpacing: -0.01 * 48,
    },

    heading1: {
      fontFamily: svaFontFamily.bodyBold,
      fontSize: 28,
      fontWeight: "600",
      lineHeight: 1.25 * 28,
      letterSpacing: -0.01 * 28,
    },

    heading2: {
      fontFamily: svaFontFamily.bodyBold,
      fontSize: 22,
      fontWeight: "600",
      lineHeight: 1.3 * 22,
      letterSpacing: 0,
    },

    title: {
      fontFamily: svaFontFamily.bodyMedium,
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 1.4 * 18,
      letterSpacing: 0,
    },

    subtitle: {
      fontFamily: svaFontFamily.body,
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 1.4 * 14,
      letterSpacing: 0,
    },

    authTitle: {
      fontFamily: svaFontFamily.display,
      fontSize: 31,
      fontWeight: "500",
      lineHeight: 34,
      letterSpacing: -0.35,
    },

    authSubtitle: {
      fontFamily: svaFontFamily.body,
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
      letterSpacing: 0,
    },

    authBody: {
      fontFamily: svaFontFamily.body,
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 18,
      letterSpacing: 0,
    },

    authFootnote: {
      fontFamily: svaFontFamily.body,
      fontSize: 11,
      fontWeight: "400",
      lineHeight: 18,
      letterSpacing: 0,
    },

    brandWordmark: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 22,
      letterSpacing: 4.8,
    },

    authLabel: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 18,
      letterSpacing: 0,
    },

    authLabelStrong: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
      letterSpacing: 0.8,
    },

    authTinyLabel: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 11,
      fontWeight: "600",
      lineHeight: 16,
      letterSpacing: 1.4,
    },

    authActionLabel: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
      letterSpacing: 1.1,
    },

    authMonoLabel: {
      fontFamily: svaFontFamily.mono,
      fontSize: 11,
      fontWeight: "400",
      lineHeight: 16,
      letterSpacing: 2.6,
    },

    body: {
      fontFamily: svaFontFamily.body,
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 1.5 * 16,
      letterSpacing: 0,
    },

    bodyMedium: {
      fontFamily: svaFontFamily.bodyMedium,
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 1.5 * 16,
      letterSpacing: 0,
    },

    caption: {
      fontFamily: svaFontFamily.body,
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 1.4 * 12,
      letterSpacing: 0.02 * 12,
    },

    label: {
      fontFamily: svaFontFamily.bodyMedium,
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 1.3 * 13,
      letterSpacing: 0.04 * 13,
    },

    button: {
      fontFamily: svaFontFamily.bodyStrong,
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 1.2 * 16,
      letterSpacing: 0.02 * 16,
    },

    input: {
      fontFamily: svaFontFamily.body,
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 1.5 * 16,
      letterSpacing: 0,
    },

    inputLabel: {
      fontFamily: svaFontFamily.bodyMedium,
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 1.2 * 12,
      letterSpacing: 0.05 * 12,
    },
  },
};
