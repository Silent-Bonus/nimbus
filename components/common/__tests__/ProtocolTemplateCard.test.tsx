import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../contexts/ThemeContext";
import { getTheme } from "../../../theme";
import ProtocolTemplateCard from "../ProtocolTemplateCard";

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
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

function renderCard(onPress = jest.fn()) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      <ProtocolTemplateCard
        item={{
          title: "528Hz: DNA Integrity",
          image: { uri: "https://example.com/soundscape.png" },
          tags: ["Frequency", "Reset"],
          imageFit: "cover",
        }}
        onPress={onPress}
      />
    </ThemeContext.Provider>
  );
}

describe("ProtocolTemplateCard", () => {
  it("renders the shared collection card content", () => {
    const tree = renderCard();

    expect(hasText(tree, "528Hz: DNA Integrity")).toBe(true);
    expect(hasText(tree, "FREQUENCY")).toBe(true);
    expect(hasText(tree, "RESET")).toBe(true);
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(onPress);

    const card = tree.root.findByProps({
      accessibilityLabel: "Open 528Hz: DNA Integrity",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
