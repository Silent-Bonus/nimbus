import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import { mockWorkoutRecommendations } from "../../../utils/workoutLibrary";
import WorkoutCard from "../WorkoutCard";

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

function renderCard(onPress = jest.fn()) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      <WorkoutCard item={mockWorkoutRecommendations[0]} onPress={onPress} />
    </ThemeContext.Provider>
  );
}

describe("WorkoutCard", () => {
  it("renders the workout card title, subtitle, and CTA", () => {
    const tree = renderCard();

    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "15 MIN · INTRODUCTORY")).toBe(true);
    expect(hasText(tree, "Start Session")).toBe(true);
  });

  it("calls onPress when the card is tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(onPress);

    const card = tree.root.findByProps({
      accessibilityLabel: "Open session for Alignment Flow",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
