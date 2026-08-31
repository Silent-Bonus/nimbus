import React from "react";
import { Modal, Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import ActionModal from "../ActionModal";

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

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

describe("ActionModal", () => {
  it("renders content and handles both actions", async () => {
    const onClose = jest.fn();
    const onPrimary = jest.fn();
    const onSecondary = jest.fn();

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ThemeContext.Provider value={themeValue as any}>
          <ActionModal
            visible
            onClose={onClose}
            eyebrow="Active Reflection"
            title="You already started this reflection"
            body="Continue where you left off with your saved answers."
            primaryAction={{
              label: "Continue Previous Session",
              onPress: onPrimary,
            }}
            secondaryAction={{
              label: "Start New Session",
              onPress: onSecondary,
            }}
          />
        </ThemeContext.Provider>
      );
    });

    expect(hasText(tree, "Active Reflection")).toBe(true);
    expect(hasText(tree, "You already started this reflection")).toBe(true);
    expect(
      hasText(tree, "Continue where you left off with your saved answers.")
    ).toBe(true);

    const buttons = tree.root.findAllByType(Pressable);
    const continueButton = buttons.find(
      (node) => node.props.accessibilityLabel === "Continue Previous Session"
    );
    const startNewButton = buttons.find(
      (node) => node.props.accessibilityLabel === "Start New Session"
    );

    await act(async () => {
      await startNewButton?.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);

    await act(async () => {
      await continueButton?.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it("supports non-closing actions and blocks dismissal while busy", async () => {
    const onClose = jest.fn();
    const onSecondary = jest.fn().mockResolvedValue(undefined);

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(
        <ThemeContext.Provider value={themeValue as any}>
          <ActionModal
            visible
            onClose={onClose}
            title="Long running action"
            body="This action should keep the modal visible while the request is in progress."
            isBusy
            primaryAction={{
              label: "Continue",
              onPress: jest.fn(),
            }}
            secondaryAction={{
              label: "Start New Session",
              onPress: onSecondary,
              closeOnPress: false,
            }}
          />
        </ThemeContext.Provider>
      );
    });

    const modal = tree.root.findByType(Modal);
    expect(modal.props.onRequestClose).toBeUndefined();

    const dismissBackdrop = tree.root.findByProps({
      accessibilityLabel: "Dismiss modal",
    });
    const closeButton = tree.root.findByProps({
      accessibilityLabel: "Close modal",
    });
    const startNewButton = tree.root.findByProps({
      accessibilityLabel: "Start New Session",
    });

    expect(dismissBackdrop.props.onPress).toBeUndefined();
    expect(closeButton.props.onPress).toBeUndefined();

    await act(async () => {
      await startNewButton.props.onPress();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(onSecondary).not.toHaveBeenCalled();
  });

  it("keeps the modal open when an action opts out of auto-close", async () => {
    const onClose = jest.fn();
    const onSecondary = jest.fn().mockResolvedValue(undefined);

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(
        <ThemeContext.Provider value={themeValue as any}>
          <ActionModal
            visible
            onClose={onClose}
            title="Long running action"
            primaryAction={{
              label: "Continue",
              onPress: jest.fn(),
            }}
            secondaryAction={{
              label: "Start New Session",
              onPress: onSecondary,
              closeOnPress: false,
            }}
          />
        </ThemeContext.Provider>
      );
    });

    const startNewButton = tree.root.findByProps({
      accessibilityLabel: "Start New Session",
    });

    await act(async () => {
      await startNewButton.props.onPress();
    });

    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
