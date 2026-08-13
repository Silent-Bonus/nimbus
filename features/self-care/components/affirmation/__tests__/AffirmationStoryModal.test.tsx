import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import { AFFIRMATION_RECOMMENDATIONS } from "../../../utils/affirmationLibrary";
import AffirmationStoryModal from "../AffirmationStoryModal";

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

jest.mock("react-native", () => require("../mockReactNative"));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

function renderModal(element: React.ReactElement) {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        {element}
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("AffirmationStoryModal", () => {
  it("renders the six-slide affirmation deck and starts on the requested slide", () => {
    const tree = renderModal(
      <AffirmationStoryModal
        visible
        onClose={jest.fn()}
        slides={AFFIRMATION_RECOMMENDATIONS}
        initialSlideId="quiet-power"
      />
    );

    expect(hasText(tree, "AFFIRMATION STORY")).toBe(true);
    expect(hasText(tree, "6 slides to hold the mood.")).toBe(true);
    expect(hasText(tree, "06 / 06")).toBe(true);
    expect(hasText(tree, "Steady Flame")).toBe(true);
    expect(
      hasText(tree, "A cleaner rhythm for focus, study, and follow-through.")
    ).toBe(true);
    expect(hasText(tree, "Quiet Ground")).toBe(true);
    expect(hasText(tree, "Clear Path")).toBe(true);
    expect(hasText(tree, "Soft Return")).toBe(true);
    expect(hasText(tree, "Rest Mode")).toBe(true);
    expect(hasText(tree, "Open Space")).toBe(true);
  });
});
