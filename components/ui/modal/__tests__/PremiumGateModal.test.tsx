import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import PremiumGateModal from "../PremiumGateModal";

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock("../../theme-components/NimbusButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    NimbusButton: ({ label, onPress, ...props }: any) =>
      React.createElement(
        Pressable,
        { accessibilityLabel: label, onPress, ...props },
        React.createElement(Text, null, label)
      ),
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

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

function renderModal(
  overrides: Partial<React.ComponentProps<typeof PremiumGateModal>> = {}
) {
  let tree!: renderer.ReactTestRenderer;
  const defaultProps: React.ComponentProps<typeof PremiumGateModal> = {
    visible: true,
    onClose: jest.fn(),
    onUpgrade: jest.fn(),
    title: "Nimbus Plus required",
    subtitle: "Preview the manifest, then unlock the full stack.",
    highlights: [
      "Full protocol stack and timing cues",
      "Expanded context and reminders",
      "Premium purchase flow",
    ],
  };

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <PremiumGateModal {...defaultProps} {...overrides} />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("PremiumGateModal", () => {
  it("renders the purchase sheet copy and actions", () => {
    const onClose = jest.fn();
    const onUpgrade = jest.fn();
    const tree = renderModal({ onClose, onUpgrade });

    expect(hasText(tree, "Premium preview")).toBe(true);
    expect(hasText(tree, "Nimbus Plus required")).toBe(true);
    expect(hasText(tree, "Preview the manifest, then unlock the full stack.")).toBe(true);
    expect(hasText(tree, "Full protocol stack and timing cues")).toBe(true);
    expect(hasText(tree, "Expanded context and reminders")).toBe(true);
    expect(hasText(tree, "Premium purchase flow")).toBe(true);

    const upgradeButton = tree.root.findByProps({
      accessibilityLabel: "Upgrade to Plus",
    });
    const dismissButton = tree.root.findByProps({
      accessibilityLabel: "Keep previewing",
    });

    act(() => {
      upgradeButton.props.onPress();
    });
    act(() => {
      dismissButton.props.onPress();
    });

    expect(onUpgrade).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
