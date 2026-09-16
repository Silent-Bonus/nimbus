import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import { ROUTES } from "../../../../constants/routes";
import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import SelfCare from "../self-care";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
  },
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Ionicons: (props: any) => React.createElement(View, props),
    MaterialCommunityIcons: (props: any) => React.createElement(View, props),
  };
});

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
        <SelfCare />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("SelfCare tab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows affirmation and breath work in the Mind section", () => {
    const tree = renderScreen();

    expect(hasText(tree, "Mind")).toBe(true);
    expect(hasText(tree, "Affirmation")).toBe(true);
    expect(hasText(tree, "Breath Work")).toBe(true);
  });

  it("navigates to the new mind practice screens", () => {
    const tree = renderScreen();

    const affirmationButton = tree.root.findByProps({
      accessibilityLabel: "Affirmation",
    });
    const breathButton = tree.root.findByProps({
      accessibilityLabel: "Breath Work",
    });

    act(() => {
      affirmationButton.props.onPress();
      breathButton.props.onPress();
    });

    expect(mockPush).toHaveBeenNthCalledWith(
      1,
      ROUTES.AUTH.SELF_CARE_AFFIRMATION
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      2,
      ROUTES.AUTH.SELF_CARE_BREATHWORK
    );
  });
});
