import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import WorkoutSessionScreen from "../WorkoutSessionScreen";

const mockBack = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useLocalSearchParams: () => ({
    id: "1",
    title: "Alignment Flow",
    subtitle: "15 MIN · INTRODUCTORY",
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const theme = getTheme("sva");
const themeValue = {
  theme: "sva",
  toggleTheme: jest.fn(),
  useSystemTheme: jest.fn(),
  newTheme: theme.colors,
  svaColors: theme.svaColors,
  spacing: theme.spacing,
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

function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <WorkoutSessionScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("WorkoutSessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the selected workout and controls", () => {
    const tree = renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "Begin Flow")).toBe(true);
    expect(hasText(tree, "Tap for a 30 sec break")).toBe(true);
  });

  it("opens the guide modal from the workout card", () => {
    const tree = renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Open guide for Alignment Flow",
    });

    act(() => {
      card.props.onPress();
    });

    expect(hasText(tree, "EXERCISE GUIDE")).toBe(true);
    expect(hasText(tree, "HOW TO DO IT")).toBe(true);
    expect(hasText(tree, "POSTURE CUES")).toBe(true);
  });
});
