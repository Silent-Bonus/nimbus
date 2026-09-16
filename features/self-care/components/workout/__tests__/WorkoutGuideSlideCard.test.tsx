import React from "react";
import { Text } from "react-native";
import renderer from "react-test-renderer";
import { Image } from "expo-image";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import WorkoutGuideSlideCard from "../WorkoutGuideSlideCard";

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

describe("WorkoutGuideSlideCard", () => {
  it("renders the guide slide image without overlay text", () => {
    const tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <WorkoutGuideSlideCard
          slide={{
            id: "slide-1",
            image: { uri: "https://example.com/slide.png" },
          }}
        />
      </ThemeContext.Provider>
    );

    expect(tree.root.findAllByType(Image)).toHaveLength(1);
    expect(hasText(tree, "STEP 01 / 03")).toBe(false);
    expect(hasText(tree, "Set the base")).toBe(false);
  });
});
