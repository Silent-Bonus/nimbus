import React from "react";
import { Share, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import MeditationDetailScreen from "../MeditationDetailScreen";
import {
  buildMeditationRouteParams,
  mockMeditationRecommendations,
} from "../../utils/meditationLibrary";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockShare = jest.fn();

let mockParams = {
  meditationId: "moonlit-reset",
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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

jest.mock("../../../../components/ui/theme-components/NimbusButton", () => {
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

function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <MeditationDetailScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("MeditationDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      meditationId: "moonlit-reset",
    };
    jest.spyOn(Share, "share").mockImplementation(mockShare);
    mockShare.mockResolvedValue({ action: "sharedAction" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the premium meditation detail layout", () => {
    const tree = renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Meditation Prelude")).toBe(true);
    expect(hasText(tree, "Moonlit Reset")).toBe(true);
    expect(hasText(tree, "ABOUT THIS SESSION")).toBe(true);
    expect(hasText(tree, "BENEFITS")).toBe(true);
    expect(hasText(tree, "Start Meditation")).toBe(true);
  });

  it("toggles favorite state and shares the meditation", () => {
    const tree = renderScreen();

    const favoriteButton = tree.root.findByProps({
      accessibilityLabel: "Add to favorites",
    });

    act(() => {
      favoriteButton.props.onPress();
    });

    expect(
      tree.root.findByProps({
        accessibilityLabel: "Remove from favorites",
      }).props.accessibilityRole
    ).toBe("button");

    const shareButton = tree.root.findByProps({
      accessibilityLabel: "Share meditation",
    });

    act(() => {
      shareButton.props.onPress();
    });

    expect(mockShare).toHaveBeenCalledWith({
      message: "Moonlit Reset · A calm reset for the nervous system when the day has been too loud.",
    });
  });

  it("starts the meditation session from the detail screen", () => {
    const tree = renderScreen();

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Meditation",
    });

    act(() => {
      startButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_PLAYER,
      params: buildMeditationRouteParams(
        mockMeditationRecommendations.find((item) => item.id === "moonlit-reset") ??
          mockMeditationRecommendations[0]
      ),
    });
  });
});
