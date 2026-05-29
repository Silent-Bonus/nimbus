import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
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
const mockCreateAsync = jest.fn();
const mockCreateWellnessSession = jest.fn();
const mockPauseWellnessSession = jest.fn();
const mockResumeWellnessSession = jest.fn();
const mockCompleteWellnessSession = jest.fn();

let mockParams = {
  soundscapeId: "5",
};

const mockSessionRef = "soundscape-session-123";

const cachedSoundscape = toSoundscapeTrack(
  {
    id: "5",
    title: "528Hz: DNA Integrity",
    duration: "10 min",
    description: "A calm frequency bed for restoration.",
    image: "https://example.com/soundscapes/528.jpg",
    source: "https://example.com/soundscapes/528.mp3",
    category: "Frequency",
    tags: ["Frequency"],
  },
  0
);

let playbackStatusCallback: ((status: any) => void) | null = null;
const mockSound = {
  setVolumeAsync: jest.fn(async () => {
    return {
      isLoaded: true,
      isPlaying: true,
      positionMillis: 15000,
      durationMillis: 180000,
    };
  }),
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
  stopAsync: jest.fn(async () => {
    playbackStatusCallback?.({
      isLoaded: true,
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 180000,
    });
  }),
  unloadAsync: jest.fn(),
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

jest.mock("expo-av", () => ({
  Audio: {
    setAudioModeAsync: (...args: any[]) => mockSetAudioModeAsync(...args),
    Sound: {
      createAsync: (...args: any[]) => mockCreateAsync(...args),
    },
  },
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

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <SoundscapePlayerScreen />
      </ThemeContext.Provider>
    );
    await Promise.resolve();
  });

  return tree;
}

describe("SoundscapePlayerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      soundscapeId: "5",
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

    mockCreateAsync.mockImplementation(
      async (source: any, options: any, onPlaybackStatusUpdate: any) => {
        playbackStatusCallback = onPlaybackStatusUpdate;
        onPlaybackStatusUpdate({
          isLoaded: true,
          isPlaying: Boolean(options?.shouldPlay),
          positionMillis: 0,
          durationMillis: 180000,
        });
        return { sound: mockSound };
      }
    );
  });

  it("loads the soundscape and renders the player surface without creating a session", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(mockSetAudioModeAsync).toHaveBeenCalled();
    expect(mockCreateAsync).toHaveBeenCalledWith(
      resolveSoundscapePlaybackSource("5"),
      expect.objectContaining({
        shouldPlay: false,
      }),
      expect.any(Function)
    );
    expect(mockCreateWellnessSession).not.toHaveBeenCalled();

    expect(hasText(tree, "NOW PLAYING")).toBe(true);
    expect(hasText(tree, "SVA LABORATORY SOUNDSCAPE")).toBe(true);
    expect(hasText(tree, "528Hz: DNA Integrity")).toBe(true);
    expect(hasText(tree, "BINAURAL ENTRAINMENT")).toBe(true);
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
      content_type: "wellness_content.wellnesscontent",
      content_object_id: expect.any(Number),
      source: "manual",
      metadata: {
        entry_surface: "session_screen",
        test_mode: true,
      },
    });
    expect(mockSound.playAsync).toHaveBeenCalledTimes(1);

    const pauseButton = tree.root.findByProps({
      accessibilityLabel: "Pause soundscape",
    });

    await act(async () => {
      await pauseButton.props.onPress();
    });

    expect(mockPauseWellnessSession).toHaveBeenCalledWith(mockSessionRef);
    expect(mockSound.pauseAsync).toHaveBeenCalledTimes(1);

    const resumedPlayButton = tree.root.findByProps({
      accessibilityLabel: "Play soundscape",
    });

    await act(async () => {
      await resumedPlayButton.props.onPress();
    });

    expect(mockResumeWellnessSession).toHaveBeenCalledWith(mockSessionRef);
    expect(mockSound.playAsync).toHaveBeenCalledTimes(2);

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

    expect(mockSound.playAsync).toHaveBeenCalledTimes(1);
    expect(mockSound.pauseAsync).toHaveBeenCalledTimes(1);
    expect(mockPauseWellnessSession).toHaveBeenCalledWith(mockSessionRef);
    expect(mockCompleteWellnessSession).not.toHaveBeenCalled();
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
        isPlaying: false,
        didJustFinish: true,
        positionMillis: 180000,
        durationMillis: 180000,
      });
      await Promise.resolve();
    });

    expect(mockCompleteWellnessSession).toHaveBeenCalledWith(mockSessionRef, {
      duration_seconds: 180,
    });
    expect(mockPauseWellnessSession).not.toHaveBeenCalled();
  });

  it("applies intensity and binaural changes and stops on timer expiry", async () => {
    jest.useFakeTimers();

    try {
      const tree = await renderScreen();

      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.68);

      const intensityButton = tree.root.findByProps({
        accessibilityLabel: "Intensity MID",
      });

      await act(async () => {
        await intensityButton.props.onPress();
      });

      expect(mockSound.setVolumeAsync).toHaveBeenLastCalledWith(0.9);

      const binauralToggle = tree.root.findByProps({
        accessibilityLabel: "Toggle binaural entrainment",
      });

      await act(async () => {
        await binauralToggle.props.onPress();
      });

      expect(mockSound.setVolumeAsync).toHaveBeenLastCalledWith(0.63);

      const timerButton = tree.root.findByProps({
        accessibilityLabel: "Sleep timer OFF",
      });

      await act(async () => {
        await timerButton.props.onPress();
      });

      expect(
        tree.root.findByProps({
          accessibilityLabel: "Sleep timer 15 MIN",
        }).props.accessibilityRole
      ).toBe("button");

      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000);
        await Promise.resolve();
      });

      expect(mockSound.stopAsync).toHaveBeenCalledTimes(1);
      expect(mockCompleteWellnessSession).not.toHaveBeenCalled();
      expect(
        tree.root.findByProps({
          accessibilityLabel: "Sleep timer OFF",
        }).props.accessibilityRole
      ).toBe("button");
    } finally {
      jest.useRealTimers();
    }
  });
});
