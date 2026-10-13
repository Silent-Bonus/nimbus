import React from "react";
import { Share, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { MeditationSessionProvider } from "../../../../contexts/MeditationSessionContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import { resolveMeditationPlaybackSource } from "../../utils/meditationPlayback";
import MeditationPlayerScreen from "../MeditationPlayerScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockShare = jest.fn();
const mockSetAudioModeAsync = jest.fn();
const mockCreateAudioPlayer = jest.fn();
const mockCreateWellnessSessionFn = jest.fn();
const mockPauseWellnessSessionFn = jest.fn();
const mockResumeWellnessSessionFn = jest.fn();
const mockCompleteWellnessSessionFn = jest.fn();

let mockParams = {
  meditationId: "1",
  meditationSlug: "relaxing-meditation",
  meditationTitle: "Relaxing Meditation",
  meditationDescription:
    "A gentle practice to release tension and find inner calm.",
  meditationGuidance:
    "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration.",
  meditationDurationLabel: "2.5 min",
  meditationSource:
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

const mockSessionRef = "c90e8cea-42af-47d2-a4b5-62e8e7bb027c";

let playbackStatusCallback: ((status: any) => void) | null = null;
const mockSound = {
  playing: false,
  isLoaded: true,
  currentTime: 15,
  duration: 180,
  pause: jest.fn(() => {
    mockSound.playing = false;
    playbackStatusCallback?.({
      isLoaded: true,
      playing: false,
      currentTime: 15,
      duration: 180,
    });
  }),
  play: jest.fn(() => {
    mockSound.playing = true;
    playbackStatusCallback?.({
      isLoaded: true,
      playing: true,
      currentTime: 15,
      duration: 180,
    });
  }),
  seekTo: jest.fn(async (position: number) => {
    playbackStatusCallback?.({
      isLoaded: true,
      playing: true,
      currentTime: position,
      duration: 180,
    });
  }),
  setActiveForLockScreen: jest.fn(),
  clearLockScreenControls: jest.fn(),
  remove: jest.fn(),
  addListener: jest.fn((_event: string, callback: (status: any) => void) => {
    playbackStatusCallback = callback;
    callback({
      isLoaded: mockSound.isLoaded,
      playing: mockSound.playing,
      currentTime: 0,
      duration: 180,
    });
    return { remove: jest.fn() };
  }),
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

jest.mock("expo-audio", () => ({
  createAudioPlayer: (...args: any[]) => mockCreateAudioPlayer(...args),
  setAudioModeAsync: (...args: any[]) => mockSetAudioModeAsync(...args),
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

jest.mock("../../services/wellnessSessionService", () => ({
  createWellnessSession: (...args: any[]) => mockCreateWellnessSessionFn(...args),
  pauseWellnessSession: (...args: any[]) => mockPauseWellnessSessionFn(...args),
  resumeWellnessSession: (...args: any[]) => mockResumeWellnessSessionFn(...args),
  completeWellnessSession: (...args: any[]) =>
    mockCompleteWellnessSessionFn(...args),
}));

const theme = getTheme("sva");
const themeValue = {
  theme: "sva",
  toggleTheme: jest.fn(),
  useSystemTheme: jest.fn(),
  newTheme: theme.colors,
  svaColors: theme.svaColors,
  spacing: theme.spacing,
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

const renderedTrees: renderer.ReactTestRenderer[] = [];

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <MeditationSessionProvider>
          <MeditationPlayerScreen />
        </MeditationSessionProvider>
      </ThemeContext.Provider>
    );
    await Promise.resolve();
  });

  renderedTrees.push(tree);
  return tree;
}

describe("MeditationPlayerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      meditationId: "1",
      meditationSlug: "relaxing-meditation",
      meditationTitle: "Relaxing Meditation",
      meditationDescription:
        "A gentle practice to release tension and find inner calm.",
      meditationGuidance:
        "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration.",
      meditationDurationLabel: "2.5 min",
      meditationSource:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    };
    playbackStatusCallback = null;

    mockCreateWellnessSessionFn.mockResolvedValue({
      success: true,
      message: "Wellness session created successfully.",
      data: {
        session_ref: mockSessionRef,
      },
    } as any);
    mockPauseWellnessSessionFn.mockResolvedValue({
      success: true,
      message: "Wellness session paused successfully.",
      data: {
        session_ref: mockSessionRef,
      },
    } as any);
    mockResumeWellnessSessionFn.mockResolvedValue({
      success: true,
      message: "Wellness session resumed successfully.",
      data: {
        session_ref: mockSessionRef,
      },
    } as any);
    mockCompleteWellnessSessionFn.mockResolvedValue({
      success: true,
      message: "Wellness session completed successfully.",
      data: {
        session_ref: mockSessionRef,
      },
    } as any);

    mockSound.playing = false;
    mockSound.isLoaded = true;
    mockSound.currentTime = 0;
    mockCreateAudioPlayer.mockImplementation(() => mockSound);

    jest.spyOn(Share, "share").mockImplementation(mockShare);
    mockShare.mockResolvedValue({ action: "sharedAction" } as any);
  });

  afterEach(async () => {
    await act(async () => {
      renderedTrees.splice(0).forEach((tree) => tree.unmount());
      await Promise.resolve();
    });
    jest.restoreAllMocks();
  });

  it("loads the meditation paused and does not create a session on mount", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(mockSetAudioModeAsync).toHaveBeenCalled();
    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(
      resolveMeditationPlaybackSource(
        "1",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      ),
      expect.objectContaining({
        updateInterval: 500,
        keepAudioSessionActive: true,
      })
    );
    expect(mockCreateWellnessSessionFn).not.toHaveBeenCalled();

    expect(hasText(tree, "Meditation")).toBe(true);
    expect(hasText(tree, "NIMBUS ORIGINAL MEDITATION")).toBe(true);
    expect(hasText(tree, "Relaxing Meditation")).toBe(true);
    expect(
      hasText(
        tree,
        "Focus on a slow inhale and a longer exhale. Let the body feel supported, then allow the mind to settle into stillness without forcing concentration."
      )
    ).toBe(true);
    expect(
      tree.root.findByProps({
        accessibilityLabel: "Play meditation",
      })
    ).toBeTruthy();
  });

  it("creates a session on play, pauses/resumes in place, and keeps playing on back", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await playButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCreateWellnessSessionFn).toHaveBeenCalledWith({
      activity_type: "meditation",
      content_slug: "relaxing-meditation",
      source: "manual",
      metadata: {
        entry_surface: "player_screen",
        test_mode: true,
      },
    });
    expect(mockSound.play).toHaveBeenCalledTimes(1);

    const pauseButton = tree.root.findByProps({
      accessibilityLabel: "Pause meditation",
    });
    const backButton = tree.root.findByProps({
      accessibilityLabel: "Back",
    });

    await act(async () => {
      await pauseButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPauseWellnessSessionFn).toHaveBeenCalledWith(mockSessionRef, {
      duration_seconds: 15,
    });
    expect(mockSound.pause).toHaveBeenCalledTimes(1);

    const resumedPlayButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await resumedPlayButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockResumeWellnessSessionFn).toHaveBeenCalledWith(mockSessionRef);
    expect(mockSound.play).toHaveBeenCalledTimes(2);

    await act(async () => {
      await backButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Leaving while playing keeps the native sound and active session alive
    // for the global floating player.
    expect(mockPauseWellnessSessionFn).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("switches to pause immediately on the first play tap before the status callback catches up", async () => {
    mockSound.play.mockImplementationOnce(() => undefined);

    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await playButton.props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({
        accessibilityLabel: "Pause meditation",
      })
    ).toBeTruthy();
    expect(mockCreateWellnessSessionFn).toHaveBeenCalledWith({
      activity_type: "meditation",
      content_slug: "relaxing-meditation",
      source: "manual",
      metadata: {
        entry_surface: "player_screen",
        test_mode: true,
      },
    });
  });

  it("does not recreate the audio instance when playback starts", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await playButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
  });

  it("queues an early play tap while audio is still loading", async () => {
    const originalLoaded = mockSound.isLoaded;
    mockSound.isLoaded = false;

    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await playButton.props.onPress();
      await Promise.resolve();
    });

    await act(async () => {
      mockSound.isLoaded = true;
      playbackStatusCallback?.({
        isLoaded: true,
        playing: false,
        currentTime: 0,
        duration: 180,
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSound.play).toHaveBeenCalledTimes(1);
    mockSound.isLoaded = originalLoaded;
    expect(mockCreateWellnessSessionFn).toHaveBeenCalledWith({
      activity_type: "meditation",
      content_slug: "relaxing-meditation",
      source: "manual",
      metadata: {
        entry_surface: "player_screen",
        test_mode: true,
      },
    });
  });

  it("completes the session only when playback finishes naturally", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });

    await act(async () => {
      await playButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      playbackStatusCallback?.({
        isLoaded: true,
        playing: false,
        currentTime: 205,
        duration: 205,
        didJustFinish: true,
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCompleteWellnessSessionFn).toHaveBeenCalledWith(
      mockSessionRef,
      {
        duration_seconds: 205,
      }
    );
  });

  it("seeks, shares, and opens the library without starting a session", async () => {
    const tree = await renderScreen();

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
      await backButton.props.onPress();
      await forwardButton.props.onPress();
      await shareButton.props.onPress();
      await libraryButton.props.onPress();
    });

    expect(mockSound.seekTo).toHaveBeenCalledWith(0);
    expect(mockSound.seekTo).toHaveBeenCalledWith(15);
    expect(mockShare).toHaveBeenCalledWith({
      message:
        "Relaxing Meditation · A gentle practice to release tension and find inner calm.",
    });
    expect(mockPush).toHaveBeenCalledWith(ROUTES.AUTH.SELF_CARE_MEDITATION);
    expect(mockCreateWellnessSessionFn).not.toHaveBeenCalled();
  });
});
