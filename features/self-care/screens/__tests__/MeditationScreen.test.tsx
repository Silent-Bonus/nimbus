import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import MeditationScreen from "../MeditationScreen";
import { getWellnessContentList } from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
}));

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
    slug: "relaxing-meditation",
    title: "Relaxing Meditation",
    modality: "meditation",
    category: "Relaxation",
    duration: "2.5 min",
    image: "https://example.com/relaxing.png",
    rating: 4.9,
    reviews: 128,
    tags: ["Calm", "Vata Balancing", "Vedic Wisdom", "Visualization"],
    level: "Beginner",
    dosha: "Vata",
  },
  {
    id: 2,
    slug: "sleep-soothing-meditation",
    title: "Sleep Soothing Meditation",
    modality: "meditation",
    category: "Sleep",
    duration: "5 min",
    image: "https://example.com/sleep.png",
    rating: 4.85,
    reviews: 96,
    tags: ["Sleep", "Wind Down", "Rest", "Evening"],
    level: "All Levels",
    dosha: "Kapha",
  },
];

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
        <MeditationScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("MeditationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWellnessContentList.mockImplementation((params) =>
      Promise.resolve({
        success: true,
        message: "Wellness content retrieved successfully.",
        data:
          params?.category === "sleep"
            ? ([wellnessContent[1]] as any)
            : (wellnessContent as any),
        pagination: {
          count: params?.category === "sleep" ? 1 : 2,
          next: null,
          previous: null,
          page: 1,
          page_size: 100,
          total_pages: 1,
          results_count: params?.category === "sleep" ? 1 : 2,
        },
      })
    );
  });

  it("renders the API-backed meditation list and opens the featured meditation with id and slug", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentList).toHaveBeenCalledWith({
      modality: "meditation",
    });

    expect(hasText(tree, "Quiet Current")).toBe(true);
    expect(hasText(tree, "CURATED RECOMMENDATION")).toBe(true);
    expect(hasText(tree, "Relaxing Meditation")).toBe(true);
    expect(hasText(tree, "Sleep Soothing Meditation")).toBe(true);
    expect(hasText(tree, "Curated pick")).toBe(true);
    expect(hasText(tree, "2 sessions")).toBe(true);
    expect(hasText(tree, "Open")).toBe(true);

    const featuredCard = tree.root.findAllByProps({
      accessibilityLabel: "Open Relaxing Meditation",
    })[0];

    act(() => {
      featuredCard.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_DETAIL,
      params: {
        meditationId: "1",
        meditationSlug: "relaxing-meditation",
      },
    });
  });

  it("filters the library by category and opens a library item with the API payload", async () => {
    const tree = await renderScreen();

    expect(() =>
      tree.root.findByProps({
        accessibilityLabel: "Beginner",
      })
    ).toThrow();

    const sleepFilter = tree.root.findByProps({
      accessibilityLabel: "Sleep",
    });

    await act(async () => {
      sleepFilter.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetWellnessContentList).toHaveBeenNthCalledWith(2, {
      modality: "meditation",
      category: "sleep",
    });
    expect(hasText(tree, "Sleep collection")).toBe(true);
    expect(hasText(tree, "Sleep Soothing Meditation")).toBe(true);
    expect(hasText(tree, "Relaxing Meditation")).toBe(false);

    const sleepCard = tree.root.findAllByProps({
      accessibilityLabel: "Open Sleep Soothing Meditation",
    })[0];

    act(() => {
      sleepCard.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_DETAIL,
      params: {
        meditationId: "2",
        meditationSlug: "sleep-soothing-meditation",
      },
    });
  });
});
