import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { getWellnessContentDetail } from "../../services/selfCareService";
import {
  clearBreathWorkDetailCache,
  cacheBreathWorkDetail,
  buildBreathWorkRouteParams,
  mapBreathworkDetail,
  type BreathWorkRouteParams,
} from "../../utils/breathworkLibrary";
import BreathWorkSessionScreen from "../BreathWorkSessionScreen";

const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockSelection = jest.fn();
const mockImpact = jest.fn();

let mockParams: BreathWorkRouteParams = {
  breathworkId: "1",
};

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: (...args: any[]) =>
    Promise.resolve(mockSelection(...args)),
  impactAsync: (...args: any[]) => Promise.resolve(mockImpact(...args)),
  ImpactFeedbackStyle: {
    Light: "light",
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

const apiDetail = {
  id: 1,
  slug: "release-path-breath",
  title: "Release Path",
  modality: "breathwork",
  category: "Relaxation",
  duration: "0 min",
  image: "https://example.com/release-path.png",
  description: "A gentle release sequence for easing tension.",
  guidance:
    "Use a slow inhale and a longer exhale so the body can unwind naturally.",
  rating: 4.9,
  reviews: 128,
  tags: ["Calm", "Release"],
  level: "Beginner",
  dosha: "Vata",
  benefits: [
    {
      id: 1,
      title: "Release Tension",
      text: "Longer exhale to soften tension and loosen the edges.",
    },
    {
      id: 2,
      title: "Ease the Body",
      text: "Unclench the jaw, soften the shoulders, and give the chest a little room.",
    },
    {
      id: 3,
      title: "Effortless Exhale",
      text: "Helps the exhale carry more of the effort than the inhale.",
    },
  ],
  tips: [
    "Let the air leave naturally instead of pushing it out.",
    "Pair the practice with a shoulder roll between rounds.",
    "If the exhale feels shaky, ease the pace before increasing the count.",
  ],
  metadata: {
    steps: [
      {
        name: "Inhale Gently",
        color: "var(--primary)",
        sanskrit: "Puraka",
        frequency: 220,
        hold_seconds: 0,
        exhale_seconds: 0,
        inhale_seconds: 4,
      },
      {
        name: "Hold Breath",
        color: "#60A5FA",
        sanskrit: "Antar Kumbhaka",
        frequency: 246.94,
        hold_seconds: 2,
        exhale_seconds: 0,
        inhale_seconds: 0,
      },
      {
        name: "Exhale Extended",
        color: "#34D399",
        sanskrit: "Rechaka",
        frequency: 196,
        hold_seconds: 0,
        exhale_seconds: 6,
        inhale_seconds: 0,
      },
      {
        name: "Hold Empty",
        color: "#A78BFA",
        sanskrit: "Bahya Kumbhaka",
        frequency: 174.61,
        hold_seconds: 2,
        exhale_seconds: 0,
        inhale_seconds: 0,
      },
    ],
  },
};

const mockGetWellnessContentDetail = getWellnessContentDetail as jest.MockedFunction<
  typeof getWellnessContentDetail
>;

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <BreathWorkSessionScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("BreathWorkSessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    clearBreathWorkDetailCache();
    const cachedDetail = mapBreathworkDetail(apiDetail, 0, null);
    cacheBreathWorkDetail(cachedDetail);
    mockParams = buildBreathWorkRouteParams(cachedDetail);
    mockGetWellnessContentDetail.mockResolvedValue({
      success: true,
      message: "Wellness content retrieved successfully.",
      data: apiDetail,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    clearBreathWorkDetailCache();
  });

  it("renders the cached breathing session and advances through phases", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentDetail).not.toHaveBeenCalled();
    expect(mockParams.breathworkId).toBe("1");
    expect(mockParams.breathworkTitle).toBe("Release Path");
    expect(mockParams.breathworkDescription).toBe(apiDetail.description);
    expect(mockParams.breathworkImage).toBe(apiDetail.image);
    expect(mockParams.breathworkTone).toBe("release");
    expect(mockParams.breathworkCategory).toBe("Relaxation");

    expect(hasText(tree, "Breath Session")).toBe(true);
    expect(
      hasText(
        tree,
        "Inhale Gently 4s · Hold Breath 2s · Exhale Extended 6s · Hold Empty 2s"
      )
    ).toBe(true);
    expect(hasText(tree, "Start")).toBe(true);
    expect(hasText(tree, "Tap play to begin this rhythm.")).toBe(true);
    expect(hasText(tree, apiDetail.title)).toBe(false);
    expect(hasText(tree, apiDetail.description)).toBe(false);

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Start breathwork",
    });

    act(() => {
      playButton.props.onPress();
    });

    expect(mockSelection).toHaveBeenCalledTimes(1);
    expect(hasText(tree, "Start")).toBe(true);
    expect(hasText(tree, "INHALE GENTLY")).toBe(true);
    expect(
      hasText(tree, "Draw the breath in with a steady, rooted count.")
    ).toBe(true);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(mockSelection).toHaveBeenCalledTimes(2);
    expect(hasText(tree, "HOLD BREATH")).toBe(true);
    expect(
      hasText(tree, "Hold gently and keep the frame steady.")
    ).toBe(true);
    expect(hasText(tree, apiDetail.description)).toBe(false);

    act(() => {
      tree.unmount();
    });
  });
});
