import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { MeditationSessionProvider } from "../../../../contexts/MeditationSessionContext";
import { getTheme } from "../../../../theme";
import {
  cacheSoundscapeTracks,
  resolveSoundscapePlaybackSource,
  toSoundscapeTrack,
} from "../../utils/soundscapeLibrary";
import SoundscapePlayerScreen from "../SoundscapePlayerScreen";

const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockSetAudioModeAsync = jest.fn();
const mockCreateAudioPlayer = jest.fn();
const mockCreateWellnessSession = jest.fn();
const mockPauseWellnessSession = jest.fn();
const mockResumeWellnessSession = jest.fn();
const mockCompleteWellnessSession = jest.fn();

let mockParams = {
  soundscapeSlug: "528hz-dna-integrity",
};

const mockSessionRef = "soundscape-session-123";

const cachedSoundscape = toSoundscapeTrack(
  {
    id: 5,
    slug: "528hz-dna-integrity",
    title: "528Hz: DNA Integrity",
    modality: "soundscape",
    duration: "10 min",
    description: "A calm frequency bed for restoration.",
    image: "https://example.com/soundscapes/528.jpg",
    source: "https://example.com/soundscapes/528.mp3",
    category: "Frequency",
    rating: 0,
    reviews: 0,
    tags: ["Frequency"],
    level: "All Levels",
    dosha: "All",
  },
  0
);

let playbackStatusCallback: ((status: any) => void) | null = null;
const mockSound = {
  volume: 0,
  isLoaded: true,
  playing: false,
  loop: false,
  currentTime: 0,
  duration: 180,
  currentStatus: {} as any,
  setActiveForLockScreen: jest.fn(),
  clearLockScreenControls: jest.fn(),
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
  remove: jest.fn(),
  addListener: jest.fn((_event: string, callback: (status: any) => void) => {
    playbackStatusCallback = callback;
    callback({
      isLoaded: true,
      playing: mockSound.playing,
      currentTime: mockSound.currentTime,
      duration: mockSound.duration,
    });
    return { remove: jest.fn() };
  }),
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

jest.mock("expo-audio", () => ({
  createAudioPlayer: (...args: any[]) => mockCreateAudioPlayer(...args),
  setAudioModeAsync: (...args: any[]) => mockSetAudioModeAsync(...args),
}));

jest.mock("@/features/self-care/services/wellnessSessionService", () => ({
  createWellnessSession: (...args: any[]) => mockCreateWellnessSession(...args),
  pauseWellnessSession: (...args: any[]) => mockPauseWellnessSession(...args),
  resumeWellnessSession: (...args: any[]) => mockResumeWellnessSession(...args),
  completeWellnessSession: (...args: any[]) =>
    mockCompleteWellnessSession(...args),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
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
          <SoundscapePlayerScreen />
        </MeditationSessionProvider>
      </ThemeContext.Provider>
    );
    await Promise.resolve();
  });

  renderedTrees.push(tree);
  return tree;
}

describe("SoundscapePlayerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      soundscapeSlug: "528hz-dna-integrity",
    };
    playbackStatusCallback = null;
    cacheSoundscapeTracks([cachedSoundscape]);

    mockCreateWellnessSession.mockResolvedValue({
      success: true,
      message: "Created",
      data: {
        session_ref: mockSessionRef,
      },
    });
    mockPauseWellnessSession.mockResolvedValue({
      success: true,
      message: "Paused",
      data: {
        session_ref: mockSessionRef,
      },
    });
    mockResumeWellnessSession.mockResolvedValue({
      success: true,
      message: "Resumed",
      data: {
        session_ref: mockSessionRef,
      },
    });
    mockCompleteWellnessSession.mockResolvedValue({
      success: true,
      message: "Completed",
      data: {
        session_ref: mockSessionRef,
      },
    });

    mockSound.playing = false;
    mockSound.currentTime = 0;
    mockSound.currentStatus = {
      isLoaded: true,
      playing: false,
      currentTime: 0,
      duration: 180,
    };
    mockCreateAudioPlayer.mockImplementation(() => mockSound);
  });

  afterEach(async () => {
    await act(async () => {
      renderedTrees.splice(0).forEach((tree) => tree.unmount());
      await Promise.resolve();
    });
  });

  it("loads the soundscape and renders the player surface without creating a session", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(mockSetAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(
      resolveSoundscapePlaybackSource("5"),
      expect.objectContaining({
        updateInterval: 500,
        keepAudioSessionActive: true,
      })
    );
    expect(mockSound.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        title: cachedSoundscape.title,
        artist: "SVA Soundscapes",
      }),
      {
        showSeekForward: true,
        showSeekBackward: true,
      }
    );
    expect(mockCreateWellnessSession).not.toHaveBeenCalled();

    expect(hasText(tree, "NOW PLAYING")).toBe(true);
    expect(hasText(tree, "SVA LABORATORY SOUNDSCAPE")).toBe(true);
    expect(hasText(tree, "528Hz: DNA Integrity")).toBe(true);
    expect(hasText(tree, "ENHANCED ATMOSPHERE")).toBe(true);
    expect(hasText(tree, "Preparing soundscape")).toBe(false);
    expect(hasText(tree, "OFF")).toBe(true);
    expect(hasText(tree, "MID")).toBe(true);
    expect(hasText(tree, "RESONATING AT 528.00 HZ")).toBe(true);
    expect(
      tree.root.findByProps({
        accessibilityLabel: "Play soundscape",
      })
    ).toBeTruthy();
    expect(hasText(tree, "Pause soundscape")).toBe(false);
  });

  it("starts a session on play, pauses it on pause, and resumes it on play again", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play soundscape",
    });

    await act(async () => {
      await playButton.props.onPress();
    });

    expect(mockCreateWellnessSession).toHaveBeenCalledWith({
      activity_type: "soundscape",
      content_slug: cachedSoundscape.slug,
      source: "manual",
      metadata: {
        entry_surface: "player_screen",
        test_mode: true,
      },
    });
    expect(mockSound.play).toHaveBeenCalledTimes(1);

    const pauseButton = tree.root.findByProps({
      accessibilityLabel: "Pause soundscape",
    });

    await act(async () => {
      await pauseButton.props.onPress();
    });

    expect(mockPauseWellnessSession).toHaveBeenCalledWith(mockSessionRef, {
      duration_seconds: 15,
    });
    expect(mockSound.pause).toHaveBeenCalledTimes(1);

    const resumedPlayButton = tree.root.findByProps({
      accessibilityLabel: "Play soundscape",
    });

    await act(async () => {
      await resumedPlayButton.props.onPress();
    });

    expect(mockResumeWellnessSession).toHaveBeenCalledWith(mockSessionRef);
    expect(mockSound.play).toHaveBeenCalledTimes(2);

    const finalPauseButton = tree.root.findByProps({
      accessibilityLabel: "Pause soundscape",
    });

    await act(async () => {
      await finalPauseButton.props.onPress();
    });

    expect(mockPauseWellnessSession).toHaveBeenCalledTimes(2);
  });

  it("pauses the session before navigating back when playback is still active", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play soundscape",
    });
    const backButton = tree.root.findByProps({
      accessibilityLabel: "Back",
    });

    await act(async () => {
      await playButton.props.onPress();
    });

    await act(async () => {
      await backButton.props.onPress();
    });

    expect(mockSound.play).toHaveBeenCalledTimes(1);
    expect(mockSound.pause).toHaveBeenCalledTimes(1);
    expect(mockPauseWellnessSession).toHaveBeenCalledWith(mockSessionRef, {
      duration_seconds: 15,
    });
    expect(mockCompleteWellnessSession).not.toHaveBeenCalled();
    expect(mockSound.clearLockScreenControls).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("completes the session only when playback ends naturally", async () => {
    const tree = await renderScreen();

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play soundscape",
    });

    await act(async () => {
      await playButton.props.onPress();
    });

    await act(async () => {
      playbackStatusCallback?.({
        isLoaded: true,
        playing: false,
        didJustFinish: true,
        currentTime: 180,
        duration: 180,
      });
      await Promise.resolve();
    });

    expect(mockCompleteWellnessSession).toHaveBeenCalledWith(mockSessionRef, {
      duration_seconds: 180,
    });
    expect(mockPauseWellnessSession).not.toHaveBeenCalled();
  });

  it("applies volume and atmosphere changes and stops on timer expiry", async () => {
    jest.useFakeTimers();

    try {
      const tree = await renderScreen();

      expect(mockSound.volume).toBe(0.68);

      const intensityButton = tree.root.findByProps({
        accessibilityLabel: "Volume MID",
      });

      await act(async () => {
        await intensityButton.props.onPress();
      });

      expect(mockSound.volume).toBe(0.9);

      const binauralToggle = tree.root.findByProps({
        accessibilityLabel: "Toggle enhanced atmosphere",
      });

      await act(async () => {
        await binauralToggle.props.onPress();
      });

      expect(mockSound.volume).toBe(0.63);

      const timerButton = tree.root.findByProps({
        accessibilityLabel: "Sleep timer OFF",
      });

      await act(async () => {
        await timerButton.props.onPress();
      });

      expect(hasText(tree, "10 MIN")).toBe(true);
    expect(mockSound.loop).toBe(true);

      expect(
        tree.root.findByProps({
          accessibilityLabel: "Sleep timer 10 MIN",
        }).props.accessibilityRole
      ).toBe("button");

      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
        await Promise.resolve();
      });

      expect(mockSound.loop).toBe(false);
      expect(mockSound.pause).toHaveBeenCalled();
      expect(mockCompleteWellnessSession).not.toHaveBeenCalled();
      expect(
        tree.root.findByProps({
          accessibilityLabel: "Sleep timer OFF",
        }).props.accessibilityRole
      ).toBe("button");
      expect(hasText(tree, "OFF")).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
