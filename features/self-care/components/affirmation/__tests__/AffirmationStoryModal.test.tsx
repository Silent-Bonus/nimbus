import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import AffirmationStoryModal from "../AffirmationStoryModal";
import type { AffirmationCard } from "../../../types/affirmation";

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

const STORY_CARDS: AffirmationCard[] = [
  {
    id: "steady-breath",
    title: "Quiet Ground",
    tone: "Calmness",
    toneCategory: "calm",
    quote: "I can move slowly and still arrive with clarity.",
    detail: "A gentle reset for days that feel too loud.",
  },
  {
    id: "clear-steps",
    title: "Clear Path",
    tone: "Confidence",
    toneCategory: "confidence",
    quote: "My next step does not need to be perfect to be enough.",
    detail: "Use this when the mind wants to over-edit the moment.",
  },
  {
    id: "soft-return",
    title: "Soft Return",
    tone: "Health",
    toneCategory: "reset",
    quote: "Every breath gives me a clean way back to myself.",
    detail: "A simple line to come back to when attention drifts.",
  },
  {
    id: "rest-is-allowed",
    title: "Rest Mode",
    tone: "Sleep",
    toneCategory: "sleep",
    quote: "Rest is part of the work, not a pause from it.",
    detail: "A quiet reminder for evening or recovery.",
  },
  {
    id: "open-space",
    title: "Open Space",
    tone: "Calmness",
    toneCategory: "calm",
    quote: "I can make room for what is true without forcing it.",
    detail: "Let the shoulders soften before making a decision.",
  },
  {
    id: "quiet-power",
    title: "Steady Flame",
    tone: "Confidence",
    toneCategory: "confidence",
    quote: "Steady energy is stronger than rushed effort.",
    statements: [
      "Steady energy is stronger than rushed effort.",
      "Calm repetition builds real confidence.",
    ],
    tags: ["focus", "study"],
    detail: "A cleaner rhythm for focus, study, and follow-through.",
  },
];

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
  it("renders the selected affirmation as a statement carousel", () => {
    const tree = renderModal(
      <AffirmationStoryModal
        visible
        onClose={jest.fn()}
        affirmation={STORY_CARDS[5]}
      />
    );

    expect(hasText(tree, "AFFIRMATION")).toBe(true);
    expect(hasText(tree, "Steady Flame")).toBe(true);
    expect(hasText(tree, "1/2")).toBe(true);
    expect(hasText(tree, "Confidence")).toBe(true);
    expect(hasText(tree, "focus")).toBe(true);
    expect(hasText(tree, "study")).toBe(true);
    expect(
      hasText(tree, "A cleaner rhythm for focus, study, and follow-through.")
    ).toBe(true);
    expect(
      hasText(tree, "Steady energy is stronger than rushed effort.")
    ).toBe(true);
    expect(hasText(tree, "Swipe to the next statement")).toBe(true);
  });
});
