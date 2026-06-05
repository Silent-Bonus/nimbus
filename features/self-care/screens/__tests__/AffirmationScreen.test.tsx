import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import AffirmationScreen from "../AffirmationScreen";
import {
  getAffirmations,
  getMockAffirmationDeck,
} from "@/features/self-care/services/affirmationService";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
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

  return tree;
}

describe("AffirmationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAffirmations as jest.Mock).mockResolvedValue(getMockAffirmationDeck());
  });

  it("renders the recommendation row and list content", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(getAffirmations).toHaveBeenCalledTimes(1);

    expect(hasText(tree, "Affirmations")).toBe(true);
    expect(hasText(tree, "RECOMMENDED LINE")).toBe(true);
    expect(hasText(tree, "Quiet Ground")).toBe(true);
    expect(hasText(tree, "I can move slowly and still arrive with clarity.")).toBe(
      true
    );
    expect(hasText(tree, "My next step does not need to be perfect to be enough.")).toBe(
      true
    );
    expect(hasText(tree, "CALM")).toBe(true);
  });

  it("opens the story modal when a card is pressed", async () => {
    const tree = await renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Choose affirmation open-space",
    });

    act(() => {
      card.props.onPress();
    });

    expect(hasText(tree, "AFFIRMATION STORY")).toBe(true);
    expect(hasText(tree, "05 / 06")).toBe(true);
    expect(
      hasText(
        tree,
        "Swipe horizontally through the selected line and the full deck."
      )
    ).toBe(true);
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
