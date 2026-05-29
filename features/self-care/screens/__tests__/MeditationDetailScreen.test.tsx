import React from "react";
import { Share, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import MeditationDetailScreen from "../MeditationDetailScreen";
import {
  buildMeditationRouteParams,
  mapMeditationTemplate,
} from "../../utils/meditationLibrary";
import {
  createWellnessSession,
  getWellnessContentDetail,
} from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockShare = jest.fn();

let mockParams = {
  meditationId: "1",
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

jest.mock("../../services/selfCareService", () => {
  const actual = jest.requireActual("../../services/selfCareService");

  return {
    ...actual,
    createWellnessSession: jest.fn(),
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

const apiDetail = {
  id: 1,
  title: "Relaxing Meditation",
  duration: "2.5 min",
  category: "Relaxation",
  image:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
  audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  description:
    "A gentle practice to release tension and find inner calm.",
  longDescription:
    "This practice uses a Sattva-forward approach to settle mental noise, soften muscular holding, and anchor awareness in the present moment.",
  guidance:
    "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration.",
  date: "Oct 24, 2026",
  dosha: "Vata",
  level: "Beginner",
  rating: 4.9,
  reviews: 128,
  tags: ["Calm", "Vata Balancing", "Vedic Wisdom", "Visualization"],
  instructor: {
    name: "Dr. Amara Sethi",
    role: "Lead Research & Vedic Scholar",
    bio: "Dr. Sethi is a lead research scholar specializing in Vedic psychology and contemplative neuroscience.",
    image:
      "https://images.unsplash.com/photo-1544367563-12123d896889?q=80&w=200&auto=format&fit=crop",
  },
  benefits: [
    {
      id: 1,
      title: "Cognitive Clarity",
      text: "Settles mental noise so attention feels less fragmented and easier to direct.",
    },
    {
      id: 2,
      title: "Nervous System Regulation",
      text: "Encourages a slower breathing rhythm that supports parasympathetic recovery.",
    },
    {
      id: 3,
      title: "Ojas Restoration",
      text: "Creates a quiet, restorative state that feels nourishing rather than stimulating.",
    },
  ],
  scientificSynthesis: {
    title: "Structural Resilience & Network Stability",
    text: "Mindfulness practice is associated with stronger attentional control and a more stable response to stress over time.",
    source:
      "Massachusetts General Hospital. (2025). Mindfulness meditation and network neuroscience review.",
  },
};

const mockGetWellnessContentDetail = getWellnessContentDetail as jest.MockedFunction<
  typeof getWellnessContentDetail
>;
const mockCreateWellnessSession = createWellnessSession as jest.MockedFunction<
  typeof createWellnessSession
>;

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <MeditationDetailScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("MeditationDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      meditationId: "1",
    };
    mockGetWellnessContentDetail.mockResolvedValue({
      success: true,
      message: "Wellness content retrieved successfully.",
      data: apiDetail as any,
    });
    mockCreateWellnessSession.mockResolvedValue({
      success: true,
      message: "Wellness session created successfully.",
      data: {
        session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
        id: 2,
        activity_type: "meditation",
        activity_type_display: "Meditation",
        content_type: "wellness_content.wellnesscontent",
        object_id: 1,
        content_label: "Relaxing Meditation",
        source: "manual",
        source_display: "Manual",
        status: "active",
        status_display: "Active",
        started_at: "2026-05-05T12:14:25.441160Z",
        paused_at: null,
        resumed_at: null,
        completed_at: null,
        duration_seconds: 0,
        metadata: {
          entry_surface: "content_detail",
          test_mode: true,
        },
        has_feedback: false,
        created_at: "2026-05-05T12:14:25.441442Z",
        updated_at: "2026-05-05T12:14:25.441474Z",
      },
    });
    jest.spyOn(Share, "share").mockImplementation(mockShare);
    mockShare.mockResolvedValue({ action: "sharedAction" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the wellness content detail and renders the enriched meditation layout", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockGetWellnessContentDetail).toHaveBeenCalledWith(1);
    expect(mockGetWellnessContentDetail).toHaveBeenCalledTimes(1);

    expect(hasText(tree, "Meditation Prelude")).toBe(true);
    expect(hasText(tree, "Relaxing Meditation")).toBe(true);
    expect(hasText(tree, "ABOUT THIS SESSION")).toBe(true);
    expect(hasText(tree, "GUIDANCE")).toBe(true);
    expect(hasText(tree, "INSTRUCTOR")).toBe(true);
    expect(hasText(tree, "BENEFITS")).toBe(true);
    expect(hasText(tree, "SCIENTIFIC SYNTHESIS")).toBe(true);
    expect(hasText(tree, "Start Meditation")).toBe(true);
    expect(hasText(tree, "Dr. Amara Sethi")).toBe(true);
    expect(hasText(tree, "Cognitive Clarity")).toBe(true);
  });

  it("toggles favorite state, shares the fetched meditation, and forwards the detail payload to the player", async () => {
    const tree = await renderScreen();

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
      message:
        "Relaxing Meditation · A gentle practice to release tension and find inner calm.",
    });

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Meditation",
    });

    await act(async () => {
      startButton.props.onPress();
      startButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCreateWellnessSession).toHaveBeenCalledWith({
      activity_type: "meditation",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: 1,
      source: "manual",
      metadata: {
        entry_surface: "content_detail",
        test_mode: true,
      },
    });
    expect(mockCreateWellnessSession).toHaveBeenCalledTimes(1);

    const expectedTemplate = mapMeditationTemplate(apiDetail as any, 0);
    const pushCall = mockPush.mock.calls.at(-1)?.[0];

    expect(pushCall).toEqual({
      pathname: ROUTES.AUTH.SELF_CARE_MEDITATION_PLAYER,
      params: expect.objectContaining({
        ...buildMeditationRouteParams(expectedTemplate),
        meditationSessionLaunchKey: expect.any(String),
      }),
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
