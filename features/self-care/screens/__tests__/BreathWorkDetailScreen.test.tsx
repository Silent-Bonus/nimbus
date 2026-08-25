import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import {
  clearBreathWorkDetailCache,
  buildBreathWorkRouteParams,
  mapBreathworkDetail,
} from "../../utils/breathworkLibrary";
import {
  getWellnessContentDetail,
} from "../../services/selfCareService";
import BreathWorkDetailScreen from "../BreathWorkDetailScreen";

const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockPush = jest.fn();
const mockSelection = jest.fn();

let mockParams = {
  breathworkId: "1",
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
    addListener: mockAddListener,
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: (...args: any[]) =>
    Promise.resolve(mockSelection(...args)),
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

const mockGetWellnessContentDetail = getWellnessContentDetail as jest.MockedFunction<
  typeof getWellnessContentDetail
>;

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
  longDescription:
    "This sequence keeps the body quiet while the breath moves with a steady, lowering pace.",
  date: "Oct 24, 2026",
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

const buildWellnessContentResponse = (data: typeof apiDetail) => ({
  success: true,
  message: "Wellness content retrieved successfully.",
  data,
});

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <BreathWorkDetailScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("BreathWorkDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearBreathWorkDetailCache();
    mockParams = {
      breathworkId: "1",
    };
    mockGetWellnessContentDetail.mockResolvedValue(
      buildWellnessContentResponse(apiDetail)
    );
  });

  afterEach(() => {
    clearBreathWorkDetailCache();
  });

  it("renders the premium breathwork detail layout", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentDetail).toHaveBeenCalledWith("1");

    expect(hasText(tree, "Breath Prelude")).toBe(true);
    expect(
      hasText(tree, "A quiet threshold before the practice begins.")
    ).toBe(true);
    expect(hasText(tree, "Release Path")).toBe(true);
    expect(hasText(tree, "DESCRIPTION")).toBe(true);
    expect(hasText(tree, "STEPS TO PERFORM")).toBe(true);
    expect(hasText(tree, "BENEFITS")).toBe(true);
    expect(hasText(tree, "TIPS")).toBe(true);
    expect(hasText(tree, "Inhale Gently (Puraka · 4s)")).toBe(true);
    expect(
      hasText(
        tree,
        "A gentle release sequence for easing tension."
      )
    ).toBe(true);
    expect(
      hasText(
        tree,
        "Helps the exhale carry more of the effort than the inhale."
      )
    ).toBe(true);
    expect(hasText(tree, "Release Tension")).toBe(true);
    expect(hasText(tree, "Ease the Body")).toBe(true);
    expect(hasText(tree, "Effortless Exhale")).toBe(true);
    expect(
      hasText(
        tree,
        "Let the air leave naturally instead of pushing it out."
      )
    ).toBe(true);
    expect(hasText(tree, "Open Breath Work")).toBe(true);
  });

  it("opens the breath session screen when the start button is pressed", async () => {
    const tree = await renderScreen();

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Open Breath Work",
    });

    await act(async () => {
      startButton.props.onPress();
      startButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSelection).toHaveBeenCalled();
    const pushCall = mockPush.mock.calls.at(-1)?.[0];

    expect(pushCall).toEqual({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_SESSION,
      params: expect.objectContaining({
        ...buildBreathWorkRouteParams(
          mapBreathworkDetail(apiDetail, 0)
        ),
      }),
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
