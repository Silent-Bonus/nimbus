export type ThemeName = "dark" | "light" | "sva";

/**
 * @interface FontSet
 * @description Defines the properties for a single font style.
 */
export interface FontSet {
  fontFamily?: string;
  fontSize: number;
  fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  lineHeight?: number;
  letterSpacing?: number;
}

/**
 * @interface Typography
 * @description Defines the typographic scale for the application.
 */
export interface Typography {
  h1: FontSet;
  h2: FontSet;
  h3: FontSet;
  h4: FontSet;
  body: FontSet;
  bodyStrong: FontSet;
  caption: FontSet;
  smallCaption: FontSet;
  button: FontSet;
}

export interface TypographyTokens {
  fontFamily: {
    body: string;
    display: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    displaySm: number;
    displayMd: number;
    displayLg: number;
  };
  fontWeight: {
    regular: "400" | "normal";
    medium: "500";
    semibold: "600";
    bold: "700" | "bold";
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    displaySm: number;
    displayMd: number;
    displayLg: number;
  };
  letterSpacing: {
    tighter: number;
    tight: number;
    normal: number;
    wide: number;
    wider: number;
  };
  textStyle: {
    displayLarge: FontSet;
    displayMedium: FontSet;
    heading1: FontSet;
    heading2: FontSet;
    title: FontSet;
    subtitle: FontSet;
    authTitle: FontSet;
    authSubtitle: FontSet;
    authBody: FontSet;
    authFootnote: FontSet;
    brandWordmark: FontSet;
    authLabel: FontSet;
    authLabelStrong: FontSet;
    authTinyLabel: FontSet;
    authActionLabel: FontSet;
    authMonoLabel: FontSet;
    body: FontSet;
    bodyMedium: FontSet;
    caption: FontSet;
    label: FontSet;
    button: FontSet;
    input: FontSet;
    inputLabel: FontSet;
  };
}

/**
 * @interface Spacing
 * @description Defines the spacing scale based on an 8-point grid system.
 */
export interface Spacing {
  xs: number; // Extra Small (4px)
  sm: number; // Small (8px)
  md: number; // Medium (16px)
  lg: number; // Large (24px)
  xl: number; // Extra Large (32px)
  xxl: number; // Extra Extra Large (48px)
  "2xl": number;
}

/**
 * @type SvaTokens
 * @description Design tokens for various UI elements.
 */
export type SvaTokens = {
  radius: { input: number; button: number; card: number; chip: number };
  size: {
    inputHeight: number;
    buttonHeight: number;
    otpBox: number;
    progressHeight: number;
  };
  layout: {
    screenX: number;
    topPad: number;
    gap: number;
    gapLg: number;
    sectionGap: number;
  };
  border: { hairline: number; strong: number };
};

/**
 * @interface ColorSet
 * @description Defines the structure for a single, complete color palette.
 */
export interface ColorSet {
  // Brand
  primary: string;
  secondary: string;

  // Accents & Status
  accent: string;
  accentPressed: string;
  info: string;
  success: string;
  warning: string;
  error: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;

  // UI
  background: string;
  surface: string; // For cards, modals, etc.
  surfaceMuted: string; // list rows / chips
  surfaceElevated: string; // lifted card variant
  card: string; // slightly lighter than background
  cardRaised: string; // for prominent cards
  divider: string;
  border: string;
  borderMuted: string;
  overlay: string;
  overlayStrong: string;
  shadow: string;

  // Focus
  focus: string; // soft outline
  focusRing: string;

  // Buttons
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonGhostBg: string;
  buttonGhostBorder: string;
  buttonGhostText: string;

  // Chart Accents
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chartGrid: string;
  chartAreaFade: string;

  // Gradients
  gradAccent: string;
  gradLime: string;
  gradBlue: string;
  gradAmber: string;

  // States
  pressed: string;
  hovered: string;
  selected: string;
  disabled: string;
}

//---------------------------------------------------------// Nested SVA color set structure
/**
 * @interface SvaColorSet
 * @description The new scalable, nested color set structure.
 */
export interface SvaColorSet {
  bg: {
    base: string;
    subtle: string;
    elevated: string;
  };
  surface: {
    base: string;
    raised: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  brand: {
    primary: string;
    primaryPressed: string;
    subtle: string;
  };
  state: {
    info: string;
    success: string;
    warning: string;
    error: string;
  };
  border: {
    default: string;
    muted: string;
    subtle: string;
  };
  divider: string;
  overlay: {
    light: string;
    strong: string;
  };
  shadow: {
    default: string;
  };
  focus: {
    color: string;
    ring: string;
  };
  button: {
    primary: {
      bg: string;
      text: string;
      pressed: string;
    };
    ghost: {
      bg: string;
      border: string;
      text: string;
    };
  };
  interaction: {
    pressed: string;
    hover: string;
    selected: string;
  };
  chart: {
    lime: string;
    blue: string;
    amber: string;
    rose: string;
    seafoam: string;
    lavender: string;
    grid: string;
    areaFade: string;
  };
  gradient: {
    accent: string;
    lime: string;
    blue: string;
    amber: string;
  };
}

//---------------------------------------------------------// Complete Theme Interface Combining Both Color Structures for Backward Compatibility and Future-Proofing
export interface SpacingTokens {
  scale: {
    px: number;
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  layout: {
    screenPadding: number;
    screenPaddingTop: {
      ios: number;
      android: number;
    };
    sectionGap: number;
    contentGap: number;
    stackGap: number;
  };
  component: {
    inputHeight: number;
    buttonHeight: number;
    chipHeight: number;
    headerHeight: number;
    headerHeightLarge: number;
  };
  icon: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  borderWidth: {
    hairline: number;
    thin: number;
    medium: number;
  };
}

export interface ComponentTokens {
  button: {
    primary: {
      height: number;
      borderRadius: number;
      paddingHorizontal: number;
      bg: string;
      text: string;
      pressedBg: string;
      disabledBg: string;
      disabledText: string;
      borderWidth: number;
      borderColor: string;
    };
    ghost: {
      height: number;
      borderRadius: number;
      paddingHorizontal: number;
      bg: string;
      text: string;
      pressedBg: string;
      borderWidth: number;
      borderColor: string;
      disabledBg: string;
      disabledText: string;
    };
    subtle: {
      height: number;
      borderRadius: number;
      paddingHorizontal: number;
      bg: string;
      text: string;
      pressedBg: string;
      borderWidth: number;
      borderColor: string;
      disabledBg: string;
      disabledText: string;
    };
  };
  input: {
    height: number;
    borderRadius: number;
    paddingHorizontal: number;
    bg: string;
    text: string;
    placeholder: string;
    borderColor: string;
    focusBorderColor: string;
    focusRingColor: string;
    disabledBg: string;
    disabledText: string;
    errorBorderColor: string;
    labelColor: string;
    helperColor: string;
    errorColor: string;
  };
  card: {
    base: {
      bg: string;
      borderColor: string;
      borderWidth: number;
      borderRadius: number;
      padding: number;
      shadowColor: string;
    };
    raised: {
      bg: string;
      borderColor: string;
      borderWidth: number;
      borderRadius: number;
      padding: number;
      shadowColor: string;
    };
    interactive: {
      bg: string;
      borderColor: string;
      selectedBorderColor: string;
      borderWidth: number;
      borderRadius: number;
      padding: number;
      pressedOverlay: string;
      selectedBg: string;
    };
  };
}

/**
 * @type AppTheme
 * @description The complete theme interface for the application.
 */
export type AppTheme = {
  name: ThemeName;
  colors: ColorSet;
  svaColors?: SvaColorSet;
  svaTypography?: TypographyTokens;
  svaSpacing?: SpacingTokens;
  svaComponents?: ComponentTokens;
  spacing: Spacing;
  typography: Typography;
  tokens: SvaTokens;
};
