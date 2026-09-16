import type { AppTheme, ColorSet, Spacing, ThemeName } from "./types";
import { tokens } from "./tokens";
import { svaColors } from "./palettes/nimbus";
import { SVATypography } from "./typography";
import { SVASpacing } from "./spacing";
import { SVAComponents } from "./components";

const spacing: Spacing = {
  xs: SVASpacing.scale.xxs,
  sm: SVASpacing.scale.xs,
  md: SVASpacing.scale.md,
  lg: SVASpacing.scale.lg,
  xl: SVASpacing.scale.xl,
  xxl: SVASpacing.scale.xxl,
  "2xl": SVASpacing.scale.xl,
};

function createLegacyColors(source: typeof svaColors): ColorSet {
  return {
    primary: "#007AFF",
    secondary: "#5856D6",
    accent: source.brand.primary,
    accentPressed: source.brand.primaryPressed,
    info: source.state.info,
    success: source.state.success,
    warning: source.state.warning,
    error: source.state.error,
    textPrimary: source.text.primary,
    textSecondary: source.text.secondary,
    textDisabled: source.text.disabled,
    background: source.bg.base,
    surface: source.surface.base,
    surfaceMuted: source.bg.subtle,
    surfaceElevated: source.surface.raised,
    card: source.surface.base,
    cardRaised: source.surface.raised,
    divider: source.divider,
    border: source.border.default,
    borderMuted: source.border.muted,
    overlay: source.overlay.light,
    overlayStrong: source.overlay.strong,
    shadow: source.shadow.default,
    focus: source.focus.color,
    focusRing: source.focus.ring,
    buttonPrimary: source.button.primary.bg,
    buttonPrimaryText: source.button.primary.text,
    buttonGhostBg: source.button.ghost.bg,
    buttonGhostBorder: source.button.ghost.border,
    buttonGhostText: source.button.ghost.text,
    chart1: source.chart.lime,
    chart2: source.chart.blue,
    chart3: source.chart.amber,
    chart4: source.chart.rose,
    chart5: source.chart.seafoam,
    chart6: source.chart.lavender,
    chartGrid: source.chart.grid,
    chartAreaFade: source.chart.areaFade,
    gradAccent: source.gradient.accent,
    gradLime: source.gradient.lime,
    gradBlue: source.gradient.blue,
    gradAmber: source.gradient.amber,
    pressed: source.interaction.pressed,
    hovered: source.interaction.hover,
    selected: source.interaction.selected,
    disabled: source.text.disabled,
  };
}

const legacyColors = createLegacyColors(svaColors);

const themes: Record<ThemeName, AppTheme> = {
  dark: {
    name: "dark",
    colors: legacyColors,
    svaColors,
    spacing,
    svaTypography: SVATypography,
    svaSpacing: SVASpacing,
    svaComponents: SVAComponents,
    tokens,
  },
  light: {
    name: "light",
    colors: legacyColors,
    svaColors,
    spacing,
    svaTypography: SVATypography,
    svaSpacing: SVASpacing,
    svaComponents: SVAComponents,
    tokens,
  },
  sva: {
    name: "sva",
    colors: legacyColors,
    svaColors,
    spacing,
    svaTypography: SVATypography,
    svaSpacing: SVASpacing,
    svaComponents: SVAComponents,
    tokens,
  },
};

export function getTheme(name: ThemeName): AppTheme {
  return themes[name] ?? themes.sva;
}
