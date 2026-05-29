import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import BreathWorkScreen from "../BreathWorkScreen";
import {
  buildBreathWorkRouteParams,
  mapBreathworkContent,
} from "../../utils/breathworkLibrary";
import { getWellnessContentList } from "../../services/selfCareService";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
let mockFocusEffect: (() => void) | undefined;

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useFocusEffect: (callback: () => void) => {
    const React = require("react");

    mockFocusEffect = callback;
    React.useEffect(() => callback(), [callback]);
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

jest.mock("../../services/selfCareService", () => {
  const actual = jest.requireActual("../../services/selfCareService");

  return {
    ...actual,
    getWellnessContentList: jest.fn(),
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

const wellnessContent = [
  {
    id: 1,
    slug: "deep-sleep-tonight",
    title: "Deep Sleep Tonight",
    modality: "breathwork",
    category: "Sleep",
    duration: "0 min",
    image: "https://example.com/sleep.png",
    rating: 0,
    reviews: 0,
    tags: [],
    level: "Beginner",
    dosha: "All",
  },
  {
    id: 2,
    slug: "find-your-calm-guided-meditation-for-anxiety-overwhelm",
    title: "Find Your Calm: Guided Meditation for Anxiety & Overwhelm",
    modality: "breathwork",
    category: "Relaxation",
    duration: "0 min",
    image: "https://example.com/calm.png",
    rating: 0,
    reviews: 0,
    tags: [],
    level: "All Levels",
    dosha: "All",
  },
];

const buildWellnessContentResponse = (data: typeof wellnessContent) => ({
  success: true,
  message: "Wellness content retrieved successfully.",
  data,
  pagination: {
    count: data.length,
    next: null,
    previous: null,
    page: 1,
    page_size: 100,
    total_pages: 1,
    results_count: data.length,
  },
});

const mockGetWellnessContentList = getWellnessContentList as jest.MockedFunction<
  typeof getWellnessContentList
>;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join("") === value
        : node.props.children === value
    );

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <BreathWorkScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

function renderLoadingScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <BreathWorkScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("BreathWorkScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect = undefined;
    mockGetWellnessContentList.mockImplementation((params) =>
      Promise.resolve(
        buildWellnessContentResponse(
          params?.category === "sleep"
            ? [wellnessContent[0] as any]
            : (wellnessContent as any)
        )
      )
    );
  });

  it("renders the API-backed breathwork list and opens the selected rhythm with hydrated params", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentList).toHaveBeenCalledWith({
      modality: "breathwork",
    });

    expect(hasText(tree, "Breath Work")).toBe(true);
    expect(
      hasText(tree, "Choose a category, then narrow the stack below.")
    ).toBe(true);
    expect(hasText(tree, "Deep Sleep Tonight")).toBe(true);
    expect(
      hasText(
        tree,
        "Find Your Calm: Guided Meditation for Anxiety & Overwhelm"
      )
    ).toBe(true);
    expect(hasText(tree, "All categories collection")).toBe(true);
    expect(hasText(tree, "2 rhythms")).toBe(true);

    const rhythmCard = tree.root.findByProps({
      accessibilityLabel: "Open rhythm Deep Sleep Tonight",
    });

    act(() => {
      rhythmCard.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_DETAIL,
      params: buildBreathWorkRouteParams(
        mapBreathworkContent(wellnessContent[0] as any, 0)
      ),
    });
  });

  it("refetches the list by category and launches the session from the visible stack card", async () => {
    const tree = await renderScreen();

    const sleepFilter = tree.root.findByProps({
      accessibilityLabel: "Sleep",
    });

    await act(async () => {
      sleepFilter.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasText(tree, "1 rhythm")).toBe(true);
    expect(hasText(tree, "Deep Sleep Tonight")).toBe(true);
    expect(
      hasText(
        tree,
        "Find Your Calm: Guided Meditation for Anxiety & Overwhelm"
      )
    ).toBe(false);
    expect(mockGetWellnessContentList).toHaveBeenNthCalledWith(2, {
      modality: "breathwork",
      category: "sleep",
    });

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play stack Deep Sleep Tonight",
    });

    act(() => {
      playButton.props.onPress({
        stopPropagation: jest.fn(),
      });
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_BREATHWORK_SESSION,
      params: buildBreathWorkRouteParams(
        mapBreathworkContent(wellnessContent[0] as any, 0)
      ),
    });
  });

  it("resets the selected pill and shows the full library when the screen regains focus", async () => {
    const tree = await renderScreen();

    const sleepFilter = tree.root.findByProps({
      accessibilityLabel: "Sleep",
    });

    await act(async () => {
      sleepFilter.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasText(tree, "1 rhythm")).toBe(true);
    expect(hasText(tree, "Deep Sleep Tonight")).toBe(true);

    await act(async () => {
      mockFocusEffect?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasText(tree, "All categories collection")).toBe(true);
    expect(hasText(tree, "2 rhythms")).toBe(true);
    expect(hasText(tree, "Deep Sleep Tonight")).toBe(true);
    expect(
      hasText(
        tree,
        "Find Your Calm: Guided Meditation for Anxiety & Overwhelm"
      )
    ).toBe(true);
  });

  it("shows a loader while the breathwork list is fetching", () => {
    mockGetWellnessContentList.mockImplementationOnce(
      () => new Promise(() => {})
    );

    const tree = renderLoadingScreen();

    expect(
      tree.root.findByProps({
        testID: "breathwork-loading-indicator",
      })
    ).toBeTruthy();
    expect(hasText(tree, "Loading breathwork...")).toBe(true);
  });
});
