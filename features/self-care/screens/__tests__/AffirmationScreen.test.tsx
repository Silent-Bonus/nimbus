import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import AffirmationScreen from "../AffirmationScreen";
import {
  consumeQueuedCreatedAffirmation,
  queueCreatedAffirmation,
} from "@/features/self-care/data/affirmationCreationInbox";
import {
  getAffirmations,
  getAffirmationBySlug,
  getMockAffirmationDeck,
} from "@/features/self-care/services/affirmationService";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
let mockFocusEffect: (() => void) | undefined;

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useFocusEffect: (callback: () => void) => {
    const React = require("react");

    mockFocusEffect = callback;
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = jest.requireActual("react-native");

  return {
    Ionicons: (props: any) => React.createElement(View, props),
    MaterialCommunityIcons: (props: any) => React.createElement(View, props),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = jest.requireActual("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock("react-native", () =>
  require("../../components/affirmation/mockReactNative")
);

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/features/self-care/services/affirmationService", () => {
  const actual = jest.requireActual(
    "@/features/self-care/services/affirmationService"
  );

  return {
    ...actual,
    getAffirmations: jest.fn(),
    getAffirmationBySlug: jest.fn(),
  };
});

const theme = getTheme("sva");
const themeValue = {
  theme: "sva",
  toggleTheme: jest.fn(),
  useSystemTheme: jest.fn(),
  newTheme: theme.colors,
  svaColors: theme.svaColors,
  spacing: theme.spacing,
  typography: theme.typography,
  svaTypography: theme.svaTypography,
  svaSpacing: theme.svaSpacing,
  svaComponents: theme.svaComponents,
  tokens: theme.tokens,
  activeTheme: theme,
};

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join("") === value
        : node.props.children === value
    );

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <AffirmationScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
  });

  await act(async () => {
    await Promise.resolve();
  });

  return tree;
}

describe("AffirmationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect = undefined;
    consumeQueuedCreatedAffirmation();
    (getAffirmations as jest.Mock).mockResolvedValue(getMockAffirmationDeck());
    (getAffirmationBySlug as jest.Mock).mockResolvedValue({
      card: {
        id: "quiet-power",
        tone: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        detail: "Fetched detail for quiet-power.",
        paletteKey: "quiet-power",
      },
      recommendation: {
        id: "quiet-power",
        tone: "confidence",
        title: "Quiet Power",
        affirmation: "Steady energy is stronger than rushed effort.",
        detail: "Fetched detail for quiet-power.",
        tag: "Confidence",
        palette: {
          colors: ["#EFE8FF", "#CEBCFB"],
          accent: "#6A55A4",
          accentSoft: "rgba(106, 85, 164, 0.16)",
          text: "#241A39",
          tagBg: "rgba(255, 255, 255, 0.60)",
          tagBorder: "rgba(36, 26, 57, 0.10)",
          tagText: "#6A55A4",
        },
      },
      source: "api",
      message: "Affirmation fetched successfully.",
    });
  });

  it("renders the recommendation row and list content", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(getAffirmations).toHaveBeenCalledTimes(1);

    expect(hasText(tree, "Affirmations")).toBe(true);
    expect(hasText(tree, "RECOMMENDED LINE")).toBe(true);
    expect(hasText(tree, "Quiet Power ii")).toBe(true);
    expect(hasText(tree, "Quiet Power")).toBe(true);
    expect(
      hasText(tree, "Steady energy is stronger than rushed effort.")
    ).toBe(true);
    expect(hasText(tree, "2 lines")).toBe(true);
  });

  it("adds a newly created affirmation back into the list on return", async () => {
    const tree = await renderScreen();

    queueCreatedAffirmation({
      card: {
        id: "soft-return",
        tone: "reset",
        quote: "I can move gently and still make progress.",
        detail: "A softer line for coming back to the work.",
        paletteKey: "soft-return",
      },
      recommendation: {
        id: "soft-return",
        tone: "reset",
        title: "Soft Return",
        affirmation: "I can move gently and still make progress.",
        detail: "A softer line for coming back to the work.",
        tag: "Reset",
        palette: {
          colors: ["#F8E4E0", "#F0B7C5"],
          accent: "#A14668",
          accentSoft: "rgba(161, 70, 104, 0.16)",
          text: "#2D1822",
          tagBg: "rgba(255, 255, 255, 0.58)",
          tagBorder: "rgba(45, 24, 34, 0.10)",
          tagText: "#A14668",
        },
      },
      source: "api",
      message: "Affirmation created successfully.",
    });

    await act(async () => {
      mockFocusEffect?.();
      await Promise.resolve();
    });

    expect(hasText(tree, "Soft Return")).toBe(true);
    expect(hasText(tree, "3 lines")).toBe(true);
  });

  it("opens the story modal and fetches the clicked affirmation detail", async () => {
    const tree = await renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Choose affirmation quiet-power",
    });

    await act(async () => {
      await card.props.onPress();
    });

    expect(getAffirmationBySlug).toHaveBeenCalledWith("quiet-power");
    expect(hasText(tree, "AFFIRMATION STORY")).toBe(true);
    expect(hasText(tree, "02 / 02")).toBe(true);
    expect(
      hasText(
        tree,
        "Swipe horizontally through the selected line and the full deck."
      )
    ).toBe(true);
    expect(hasText(tree, "Fetched detail for quiet-power.")).toBe(true);
  });

  it("opens the custom affirmation screen from the pencil action", async () => {
    const tree = await renderScreen();

    const pencil = tree.root.findByProps({
      accessibilityLabel: "Create custom affirmation",
    });

    act(() => {
      pencil.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith(
      ROUTES.AUTH.SELF_CARE_CREATE_AFFIRMATION
    );
  });
});
