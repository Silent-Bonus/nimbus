import React from "react";
import { Text } from "react-native";
import { Image } from "expo-image";
import renderer from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import { mockWorkoutRecommendations } from "../../../utils/workoutLibrary";
import WorkoutGuideModal from "../WorkoutGuideModal";

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

describe("WorkoutGuideModal", () => {
  it("renders the guide content for the selected workout", () => {
    const tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <WorkoutGuideModal
          workout={mockWorkoutRecommendations[0]}
          onClose={jest.fn()}
        />
      </ThemeContext.Provider>
    );

    expect(hasText(tree, "EXERCISE GUIDE")).toBe(true);
    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "Easy")).toBe(false);
    expect(tree.root.findAllByType(Image)).toHaveLength(7);
    expect(hasText(tree, "HOW TO DO IT")).toBe(true);
    expect(hasText(tree, "POSTURE CUES")).toBe(true);
  });
});
