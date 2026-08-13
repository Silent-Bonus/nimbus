import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import AffirmationRecommendationCard from "../AffirmationRecommendationCard";

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

describe("AffirmationRecommendationCard", () => {
  it("renders the title, affirmation and tag", () => {
    const tree = renderCard(
      <AffirmationRecommendationCard
        item={{
          id: "steady-breath",
          tone: "Calmness",
          toneCategory: "calm",
          title: "Quiet Ground",
          affirmation: "I can move slowly and still arrive with clarity.",
          tag: "Calm",
          palette: {
            colors: ["#F6F1E4", "#D8E7C5"],
            accent: "#5B7746",
            accentSoft: "rgba(91, 119, 70, 0.18)",
            text: "#182114",
            tagBg: "rgba(255, 255, 255, 0.58)",
            tagBorder: "rgba(35, 48, 26, 0.12)",
            tagText: "#35592A",
          },
        }}
        selected
        onPress={jest.fn()}
        width={300}
      />
    );

    expect(hasText(tree, "Quiet Ground")).toBe(true);
    expect(
      hasText(tree, "I can move slowly and still arrive with clarity.")
    ).toBe(true);
    expect(hasText(tree, "Calmness")).toBe(true);
    expect(hasText(tree, "Selected")).toBe(true);
  });

  it("calls onPress when the card is tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(
      <AffirmationRecommendationCard
        item={{
          id: "clear-steps",
          tone: "Confidence",
          toneCategory: "confidence",
          title: "Clear Path",
          affirmation: "My next step does not need to be perfect to be enough.",
          tag: "Confidence",
          palette: {
            colors: ["#EAF4FF", "#BAD4F1"],
            accent: "#2F628E",
            accentSoft: "rgba(47, 98, 142, 0.18)",
            text: "#132235",
            tagBg: "rgba(255, 255, 255, 0.62)",
            tagBorder: "rgba(19, 34, 53, 0.10)",
            tagText: "#2F628E",
          },
        }}
        onPress={onPress}
        width={300}
      />
    );

    const card = tree.root.findByProps({
      accessibilityLabel: "Choose recommendation Clear Path",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: "clear-steps" })
    );
  });
});
