import React from "react";
import { Share, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import SoundscapeDetailScreen from "../SoundscapeDetailScreen";
import { getWellnessContentDetail } from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockShare = jest.fn();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

let mockParams = {
  soundscapeId: "1",
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

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: any[]) => mockGetItem(...args),
  setItem: (...args: any[]) => mockSetItem(...args),
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

jest.mock("../../services/selfCareService", () => {
  const actual = jest.requireActual("../../services/selfCareService");

  return {
    ...actual,
    getWellnessContentDetail: jest.fn(),
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

const mockGetWellnessContentDetail = getWellnessContentDetail as jest.MockedFunction<
  typeof getWellnessContentDetail
>;

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <SoundscapeDetailScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("SoundscapeDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
    mockParams = {
      soundscapeId: "1",
    };
    jest.spyOn(Share, "share").mockImplementation(mockShare);
    mockShare.mockResolvedValue({ action: "sharedAction" });
    mockGetWellnessContentDetail.mockResolvedValue({
      success: true,
      message: "Wellness content retrieved successfully.",
      data: {
        id: 1,
        title: "Rain Over Cedar 528 Hz",
        duration: "10 min",
        category: "Nature",
        image: "https://example.com/rain.jpg",
        audio: "https://example.com/rain.mp3",
        description: "Late rain, cedar hush, and low-frequency calm for sleep.",
        longDescription:
          "A longer drifting layer of cedar rain and low movement designed for unhurried settling.",
        rating: 0,
        benefits: [
          {
            id: 26,
            title: "testing 1",
            text: "added this to test for soundscape where it is coming or not",
          },
        ],
        tags: ["Nature", "Sleep"],
        isLocked: false,
      } as any,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the soundscape detail layout from the fetched content", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentDetail).toHaveBeenCalledWith(1);

    expect(hasText(tree, "Soundscape Prelude")).toBe(true);
    expect(hasText(tree, "Rain Over Cedar 528 Hz")).toBe(true);
    expect(hasText(tree, "ABOUT THIS SOUNDSCAPE")).toBe(true);
    expect(
      tree.root.findByProps({
        accessibilityLabel: "Soundscape rating 4",
      }).props.accessibilityLabel
    ).toBe("Soundscape rating 4");
    expect(hasText(tree, "528.00 HZ")).toBe(true);
    expect(hasText(tree, "TEST MOOD")).toBe(true);
    expect(hasText(tree, "DEEPER LISTENING")).toBe(true);
    expect(
      hasText(
        tree,
        "A longer drifting layer of cedar rain and low movement designed for unhurried settling."
      )
    ).toBe(true);
    expect(hasText(tree, "WHY IT HELPS")).toBe(true);
    expect(hasText(tree, "testing 1")).toBe(true);
    expect(
      hasText(
        tree,
        "added this to test for soundscape where it is coming or not"
      )
    ).toBe(true);
    expect(hasText(tree, "Start Soundscape")).toBe(true);
  });

  it("toggles favorite state and shares the fetched soundscape", async () => {
    const tree = await renderScreen();

    const favoriteButton = tree.root.findByProps({
      accessibilityLabel: "Add to favorites",
    });

    await act(async () => {
      favoriteButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSetItem).toHaveBeenLastCalledWith(
      "soundscape_favorites_v1",
      JSON.stringify(["1"])
    );

    expect(
      tree.root.findByProps({
        accessibilityLabel: "Remove from favorites",
      }).props.accessibilityRole
    ).toBe("button");

    const shareButton = tree.root.findByProps({
      accessibilityLabel: "Share soundscape",
    });

    await act(async () => {
      shareButton.props.onPress();
      await Promise.resolve();
    });

    expect(mockShare).toHaveBeenCalledWith({
      message:
        "Rain Over Cedar 528 Hz · Late rain, cedar hush, and low-frequency calm for sleep.",
    });
  });

  it("opens the soundscape player from the detail screen", async () => {
    const tree = await renderScreen();

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Soundscape",
    });

    act(() => {
      startButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE_PLAYER,
      params: {
        soundscapeId: "1",
      },
    });
  });
});
