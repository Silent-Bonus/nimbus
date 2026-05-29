import React from "react";
import { Share, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import { completeWellnessSession } from "../../services/selfCareService";
import { resolveMeditationPlaybackSource } from "../../utils/meditationPlayback";
import MeditationPlayerScreen from "../MeditationPlayerScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockShare = jest.fn();
const mockSetAudioModeAsync = jest.fn();
const mockCreateAsync = jest.fn();

let mockParams = {
  meditationId: "1",
  meditationTitle: "Relaxing Meditation",
  meditationDescription:
    "A gentle practice to release tension and find inner calm.",
  meditationGuidance:
    "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration.",
  meditationDurationLabel: "2.5 min",
  meditationSessionRef: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
  meditationSource: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

let playbackStatusCallback: ((status: any) => void) | null = null;
const mockSound = {
  pauseAsync: jest.fn(async () => {
    playbackStatusCallback?.({
      isLoaded: true,
      isPlaying: false,
      positionMillis: 15000,
      durationMillis: 180000,
    });
  }),
  playAsync: jest.fn(async () => {
    playbackStatusCallback?.({
      isLoaded: true,
      isPlaying: true,
      positionMillis: 15000,
      durationMillis: 180000,
    });
  }),
  setPositionAsync: jest.fn(async (position: number) => {
    playbackStatusCallback?.({
      isLoaded: true,
      isPlaying: true,
      positionMillis: position,
      durationMillis: 180000,
    });
  }),
  unloadAsync: jest.fn(),
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

jest.mock("expo-av", () => ({
  Audio: {
    setAudioModeAsync: (...args: any[]) => mockSetAudioModeAsync(...args),
    Sound: {
      createAsync: (...args: any[]) => mockCreateAsync(...args),
    },
  },
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

jest.mock("../../services/selfCareService", () => {
  const actual = jest.requireActual("../../services/selfCareService");

  return {
    ...actual,
    completeWellnessSession: jest.fn(),
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

const mockCompleteWellnessSessionFn = completeWellnessSession as jest.MockedFunction<
  typeof completeWellnessSession
>;

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <MeditationPlayerScreen />
      </ThemeContext.Provider>
    );
    await Promise.resolve();
  });

  return tree;
}

describe("MeditationPlayerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      meditationId: "1",
      meditationTitle: "Relaxing Meditation",
      meditationDescription:
        "A gentle practice to release tension and find inner calm.",
      meditationGuidance:
        "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration.",
      meditationDurationLabel: "2.5 min",
      meditationSessionRef: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
      meditationSource:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    };
    playbackStatusCallback = null;
    mockCompleteWellnessSessionFn.mockResolvedValue({
      success: true,
      message: "Wellness session completed successfully.",
      data: {
        session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
        id: 2,
        activity_type: "soundscape",
        activity_type_display: "Soundscape",
        content_type: "wellness_content.wellnesscontent",
        object_id: 1,
        content_label: "Relaxing Meditation",
        source: "manual",
        source_display: "Manual",
        status: "completed",
        status_display: "Completed",
        started_at: "2026-05-05T12:14:25.441160Z",
        paused_at: null,
        resumed_at: null,
        completed_at: "2026-05-05T12:23:22.757043Z",
        duration_seconds: 205,
        metadata: {
          entry_surface: "content_detail",
          test_mode: true,
        },
        has_feedback: false,
        created_at: "2026-05-05T12:14:25.441442Z",
        updated_at: "2026-05-05T12:23:22.757187Z",
      },
    });

    mockCreateAsync.mockImplementation(
      async (source: any, options: any, onPlaybackStatusUpdate: any) => {
        playbackStatusCallback = onPlaybackStatusUpdate;
        onPlaybackStatusUpdate({
          isLoaded: true,
          isPlaying: true,
          positionMillis: 0,
          durationMillis: 180000,
        });
        return { sound: mockSound };
      }
    );

    jest.spyOn(Share, "share").mockImplementation(mockShare);
    mockShare.mockResolvedValue({ action: "sharedAction" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the local meditation audio and renders the premium player surface", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(mockSetAudioModeAsync).toHaveBeenCalled();
    expect(mockCreateAsync).toHaveBeenCalledWith(
      resolveMeditationPlaybackSource(
        "1",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      ),
      expect.objectContaining({
        shouldPlay: true,
      }),
      expect.any(Function)
    );

    expect(hasText(tree, "SVA")).toBe(false);
    expect(hasText(tree, "Meditation")).toBe(true);
    expect(hasText(tree, "NIMBUS ORIGINAL MEDITATION")).toBe(true);
    expect(hasText(tree, "Relaxing Meditation")).toBe(true);
    expect(
      hasText(
        tree,
        "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration."
      )
    ).toBe(true);

    await act(async () => {
      playbackStatusCallback?.({
        isLoaded: true,
        isPlaying: false,
        positionMillis: 205000,
        durationMillis: 205000,
        didJustFinish: true,
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCompleteWellnessSessionFn).toHaveBeenCalledWith(
      "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
      {
        duration_seconds: 205,
      }
    );
  });

  it("pauses, seeks, shares, and returns to the library", async () => {
    const tree = await renderScreen();

    const pauseButton = tree.root.findByProps({
      accessibilityLabel: "Pause meditation",
    });
    const backButton = tree.root.findByProps({
      accessibilityLabel: "Seek backward 15 seconds",
    });
    const forwardButton = tree.root.findByProps({
      accessibilityLabel: "Seek forward 15 seconds",
    });
    const shareButton = tree.root.findByProps({
      accessibilityLabel: "Share",
    });
    const libraryButton = tree.root.findByProps({
      accessibilityLabel: "Library",
    });

    await act(async () => {
      await pauseButton.props.onPress();
      await backButton.props.onPress();
      await forwardButton.props.onPress();
      await shareButton.props.onPress();
      await libraryButton.props.onPress();
    });

    expect(mockSound.pauseAsync).toHaveBeenCalledTimes(1);
    expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    expect(mockSound.setPositionAsync).toHaveBeenCalledWith(15000);
    expect(mockShare).toHaveBeenCalledWith({
      message:
        "Relaxing Meditation · A gentle practice to release tension and find inner calm.",
    });
    expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.SELF_CARE_MEDITATION);

    await act(async () => {
      playbackStatusCallback?.({
        isLoaded: true,
        isPlaying: true,
        positionMillis: 15000,
        durationMillis: 180000,
      });
      tree.unmount();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCompleteWellnessSessionFn).toHaveBeenCalledWith(
      "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
      {
        duration_seconds: 15,
      }
    );
  });
});
