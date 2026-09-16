import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import WorkoutListScreen from "../WorkoutListScreen";

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
        <WorkoutListScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("WorkoutListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the workout library header, filters, and curated cards", () => {
    const tree = renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Workouts")).toBe(true);
    expect(
      hasText(
        tree,
        "Find your rhythm in the silence. Move with intention, breathe with grace."
      )
    ).toBe(true);
    expect(hasText(tree, "All")).toBe(true);
    expect(hasText(tree, "Cardio")).toBe(true);
    expect(hasText(tree, "Strength")).toBe(true);
    expect(hasText(tree, "Yoga")).toBe(true);
    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "Bodyweight Blitz")).toBe(true);
    expect(hasText(tree, "Iron Core Strength")).toBe(true);
    expect(hasText(tree, "Heart Rate Hero")).toBe(true);
    expect(hasText(tree, "Start Session")).toBe(true);
  });

  it("filters the workout cards by category", () => {
    const tree = renderScreen();

    const strengthFilter = tree.root.findByProps({
      accessibilityLabel: "Strength",
    });

    act(() => {
      strengthFilter.props.onPress();
    });

    expect(hasText(tree, "Iron Core Strength")).toBe(true);
    expect(hasText(tree, "Alignment Flow")).toBe(false);
    expect(hasText(tree, "Bodyweight Blitz")).toBe(false);
    expect(hasText(tree, "Heart Rate Hero")).toBe(false);
  });

  it("opens the workout session screen when a card is tapped", () => {
    const tree = renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Open session for Alignment Flow",
    });

    act(() => {
      card.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/self-care/workoutSession",
      params: {
        id: "1",
        title: "Alignment Flow",
        subtitle: "15 MIN · INTRODUCTORY",
      },
    });
  });
});
