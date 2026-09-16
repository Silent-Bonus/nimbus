import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import ExerciseIntroCard from "../ExerciseIntroCard";

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

describe("ExerciseIntroCard", () => {
  it("renders the exercise summary and open guide action", () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <ExerciseIntroCard
          imageUri={{ uri: "https://example.com/workout.png" }}
          reps={2}
          description="A clean, controlled descent with a quiet finish."
          title="Alignment Flow"
          subtitle="SESSION MODE"
          onPress={onPress}
        />
      </ThemeContext.Provider>
    );

    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "2 repetitions")).toBe(true);
    expect(hasText(tree, "Open Guide")).toBe(true);

    const card = tree.root.findByProps({
      accessibilityLabel: "Open guide for Alignment Flow",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
