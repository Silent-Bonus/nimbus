import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import AffirmationListCard from "../AffirmationListCard";

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

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

function renderCard(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("AffirmationListCard", () => {
  it("renders the title, detail, and tone chip", () => {
    const tree = renderCard(
      <AffirmationListCard
        item={{
          id: "clear-steps",
          title: "Clear Path",
          tone: "Confidence",
          toneCategory: "confidence",
          quote: "My next step does not need to be perfect to be enough.",
          detail: "Use this when the mind wants to over-edit the moment.",
        }}
        onPress={jest.fn()}
      />
    );

    expect(hasText(tree, "Clear Path")).toBe(true);
    expect(hasText(tree, "Use this when the mind wants to over-edit the moment.")).toBe(
      true
    );
    expect(hasText(tree, "Confidence")).toBe(true);
    expect(
      hasText(tree, "My next step does not need to be perfect to be enough.")
    ).toBe(false);
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(
      <AffirmationListCard
        item={{
          id: "open-space",
          title: "Open Space",
          tone: "Calmness",
          toneCategory: "calm",
          quote: "I can make room for what is true without forcing it.",
          detail: "Let the shoulders soften before making a decision.",
        }}
        onPress={onPress}
      />
    );

    const card = tree.root.findByProps({
      accessibilityLabel: "Choose affirmation Open Space",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: "open-space" })
    );
  });
});
