import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import SoundscapeScreen from "../SoundscapeScreen";

const mockBack = jest.fn();
const mockGoBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockGetWellnessContentList = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
    addListener: mockAddListener,
    goBack: mockGoBack,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: any[]) => mockGetItem(...args),
  setItem: (...args: any[]) => mockSetItem(...args),
}));

jest.mock("@/features/self-care/services/selfCareService", () => ({
  getWellnessContentList: (...args: any[]) =>
    mockGetWellnessContentList(...args),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Ionicons: (props: any) => React.createElement(View, props),
    MaterialCommunityIcons: (props: any) => React.createElement(View, props),
  };
});

jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
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

const rawTracks = [
  {
    id: "rain-cedar",
    title: "Rain Over Cedar",
    duration: "10 min",
    description: "Late rain, cedar hush, and low-frequency calm.",
    image: "https://example.com/rain.jpg",
    source: "https://example.com/rain.mp3",
    category: "Nature",
    isLocked: false,
  },
  {
    id: "ocean-drift",
    title: "Ocean Drift",
    duration: "12 min",
    description: "Slow surf texture for sleep and deep reset.",
    image: "https://example.com/ocean.jpg",
    source: "https://example.com/ocean.mp3",
    category: "Sleep",
    isLocked: false,
  },
];

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <SoundscapeScreen />
      </ThemeContext.Provider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("SoundscapeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
    mockGetWellnessContentList.mockResolvedValue({ data: rawTracks });
  });

  it("shows favorites and category filters, then filters the library correctly", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentList).toHaveBeenCalledTimes(1);
    expect(mockGetWellnessContentList).toHaveBeenCalledWith({
      modality: "soundscape",
    });
    expect(tree.root.findAllByProps({ accessibilityLabel: "Show favorites" })).toHaveLength(0);
    expect(tree.root.findByProps({ accessibilityLabel: "Favorites" })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: "Nature" })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: "Sleep" })).toBeTruthy();
    expect(hasText(tree, "Rain Over Cedar")).toBe(true);
    expect(hasText(tree, "Ocean Drift")).toBe(true);

    const natureFilter = tree.root.findByProps({
      accessibilityLabel: "Nature",
    });

    act(() => {
      natureFilter.props.onPress();
    });

    expect(hasText(tree, "Rain Over Cedar")).toBe(true);
    expect(hasText(tree, "Ocean Drift")).toBe(false);

    const favoriteTag = tree.root.findByProps({
      accessibilityLabel: "Add Rain Over Cedar to favorites",
    });

    await act(async () => {
      favoriteTag.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSetItem).toHaveBeenLastCalledWith(
      "soundscape_favorites_v1",
      JSON.stringify(["rain-cedar"])
    );

    expect(
      tree.root.findByProps({
        accessibilityLabel: "Remove Rain Over Cedar from favorites",
      }).props.accessibilityRole
    ).toBe("button");

    const favoritesFilter = tree.root.findByProps({
      accessibilityLabel: "Favorites",
    });

    act(() => {
      favoritesFilter.props.onPress();
    });

    expect(hasText(tree, "A private stack of saved soundscapes.")).toBe(true);
    expect(hasText(tree, "Rain Over Cedar")).toBe(true);
    expect(hasText(tree, "Ocean Drift")).toBe(false);
  });
});
