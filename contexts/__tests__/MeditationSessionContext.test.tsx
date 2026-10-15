import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import {
  MeditationSessionProvider,
  useMeditationSession,
} from "../MeditationSessionContext";

let sessionValue!: ReturnType<typeof useMeditationSession>;

const Probe = () => {
  sessionValue = useMeditationSession();
  return <Text>{sessionValue.status}</Text>;
};

const renderSession = () =>
  renderer.create(
    <MeditationSessionProvider>
      <Probe />
    </MeditationSessionProvider>
  );

describe("MeditationSessionProvider handoff", () => {
  it("hands the same content session to the next player", async () => {
    const onTakeover = jest.fn(async () => ({
      sessionRef: "session-a",
      elapsedSeconds: 42,
      wasPlaying: true,
    }));
    const onStop = jest.fn();
    const tree = renderSession();

    await act(async () => {
      sessionValue.registerControls({ onTakeover, onStop });
      sessionValue.startSession({
        mode: "meditation",
        contentId: "meditation-a",
      });
    });

    let handoff;
    await act(async () => {
      handoff = await sessionValue.prepareForContent("meditation-a");
    });

    expect(handoff).toEqual({
      sessionRef: "session-a",
      elapsedSeconds: 42,
      wasPlaying: true,
    });
    expect(onTakeover).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();
    expect(sessionValue.activeSession?.contentId).toBe("meditation-a");
    expect(sessionValue.activeSession?.elapsedSeconds).toBe(42);
    expect(sessionValue.status).toBe("running");

    await act(async () => {
      tree.unmount();
    });
  });

  it("stops and clears the previous session for different content", async () => {
    const onStop = jest.fn();
    const tree = renderSession();

    await act(async () => {
      sessionValue.registerControls({ onStop });
      sessionValue.startSession({
        mode: "meditation",
        contentId: "meditation-a",
      });
    });

    await act(async () => {
      await sessionValue.prepareForContent("meditation-b");
    });

    expect(onStop).toHaveBeenCalledWith(0);
    expect(sessionValue.activeSession).toBeNull();
    expect(sessionValue.status).toBe("idle");

    await act(async () => {
      tree.unmount();
    });
  });

  it("does not adopt a same-content session without a backend reference", async () => {
    const onTakeover = jest.fn(async () => ({
      sessionRef: null,
      elapsedSeconds: 10,
      wasPlaying: false,
    }));
    const onStop = jest.fn();
    const tree = renderSession();

    await act(async () => {
      sessionValue.registerControls({ onTakeover, onStop });
      sessionValue.startSession({
        mode: "meditation",
        contentId: "meditation-a",
      });
    });

    let handoff;
    await act(async () => {
      handoff = await sessionValue.prepareForContent("meditation-a");
    });

    expect(handoff).toBeNull();
    expect(onStop).toHaveBeenCalledWith(0);
    expect(sessionValue.activeSession).toBeNull();
    expect(sessionValue.status).toBe("idle");

    await act(async () => {
      tree.unmount();
    });
  });
});
