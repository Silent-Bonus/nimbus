import React from "react";
import { Pressable, Text, View } from "react-native";
import renderer, { act } from "react-test-renderer";

import { ROUTES } from "@/constants/routes";
import {
  MOCK_FREE_USER_PROFILE,
  MOCK_PLUS_USER_PROFILE,
} from "@/features/auth/data/mockUserProfiles";
import type { UserProfile } from "@/features/auth/types/userProfile";

import { PremiumGateProvider, usePremiumGate } from "../PremiumGateContext";

const mockPush = jest.fn();

let mockUserProfile: UserProfile | null = MOCK_FREE_USER_PROFILE;

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
  },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    userProfile: mockUserProfile,
  }),
}));

jest.mock("@/components/ui/modal/PremiumGateModal", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return function MockPremiumGateModal(props: any) {
    if (!props.visible) return null;

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, props.title),
      React.createElement(Text, null, props.subtitle),
      React.createElement(Text, null, props.primaryLabel),
      React.createElement(Text, null, props.secondaryLabel),
      React.createElement(
        Pressable,
        { accessibilityLabel: "gate-upgrade", onPress: props.onUpgrade },
        React.createElement(Text, null, "Upgrade")
      ),
      React.createElement(
        Pressable,
        { accessibilityLabel: "gate-close", onPress: props.onClose },
        React.createElement(Text, null, "Close")
      )
    );
  };
});

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root.findAllByType(Text).some((node) => getTextContent(node) === value);

function GateHarness() {
  const { openGate, getAccessState, activeGate, canAccess } = usePremiumGate();

  return (
    <View>
      <Text>{getAccessState("curated_manifest_detail")}</Text>
      <Text>{String(canAccess("curated_manifest_detail"))}</Text>
      <Text>{activeGate?.featureKey ?? "none"}</Text>

      <Pressable
        accessibilityLabel="open-detail-gate"
        onPress={() => openGate("curated_manifest_detail", "screen_entry")}
      >
        <Text>Open detail gate</Text>
      </Pressable>
    </View>
  );
}

function renderHarness() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <PremiumGateProvider>
        <GateHarness />
      </PremiumGateProvider>
    );
  });

  return tree;
}

describe("PremiumGateContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserProfile = MOCK_FREE_USER_PROFILE;
  });

  it("opens the shared gate for free users and dismisses cleanly", () => {
    const tree = renderHarness();

    expect(hasText(tree, "preview")).toBe(true);
    expect(hasText(tree, "false")).toBe(true);
    expect(hasText(tree, "none")).toBe(true);

    act(() => {
      tree.root.findByProps({
        accessibilityLabel: "open-detail-gate",
      }).props.onPress();
    });

    expect(hasText(tree, "curated_manifest_detail")).toBe(true);
    expect(hasText(tree, "Nimbus Plus required")).toBe(true);
    expect(hasText(tree, "Upgrade to Plus")).toBe(true);

    act(() => {
      tree.root.findByProps({
        accessibilityLabel: "gate-close",
      }).props.onPress();
    });

    expect(hasText(tree, "Nimbus Plus required")).toBe(false);
    expect(hasText(tree, "curated_manifest_detail")).toBe(false);
  });

  it("routes to billing from the shared gate upgrade action", () => {
    const tree = renderHarness();

    act(() => {
      tree.root.findByProps({
        accessibilityLabel: "open-detail-gate",
      }).props.onPress();
    });

    act(() => {
      tree.root.findByProps({
        accessibilityLabel: "gate-upgrade",
      }).props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.BILLING_UPGRADE);
  });

  it("does not open the gate for premium users", () => {
    mockUserProfile = MOCK_PLUS_USER_PROFILE;

    const tree = renderHarness();

    expect(hasText(tree, "allowed")).toBe(true);
    expect(hasText(tree, "true")).toBe(true);

    act(() => {
      tree.root.findByProps({
        accessibilityLabel: "open-detail-gate",
      }).props.onPress();
    });

    expect(hasText(tree, "Nimbus Plus required")).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
