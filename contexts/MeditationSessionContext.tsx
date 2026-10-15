import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type MeditationSessionMode = "anchor" | "meditation" | "soundscape";
export type MeditationSessionSource =
  | "daily-checkin"
  | "meditation"
  | "soundscape"
  | "anchor";
export type MeditationSessionStatus = "idle" | "running" | "paused";

export type MeditationSessionMetadata = {
  checkInId?: string;
  date?: string;
  contentId?: string;
};

export type MeditationSession = MeditationSessionMetadata & {
  mode: MeditationSessionMode;
  source: MeditationSessionSource;
  title: string;
  startedAt: string;
  elapsedSeconds: number;
  goalSeconds?: number;
};

export type MeditationSessionControls = {
  onPause?: (elapsedSeconds: number) => Promise<void> | void;
  onResume?: () => Promise<void> | void;
  onStop?: (elapsedSeconds: number) => Promise<void> | void;
  onTakeover?: () => Promise<MeditationSessionHandoff> | MeditationSessionHandoff;
  getIsPlaying?: () => boolean | null;
};

export type MeditationSessionHandoff = {
  sessionRef?: string | null;
  elapsedSeconds: number;
  wasPlaying: boolean;
};

type StartSessionInput = MeditationSessionMetadata & {
  mode: MeditationSessionMode;
  source?: MeditationSessionSource;
  title?: string;
  goalSeconds?: number;
};

type MeditationSessionContextValue = {
  activeSession: MeditationSession | null;
  status: MeditationSessionStatus;
  isActive: boolean;
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  prepareForContent: (
    contentId: string
  ) => Promise<MeditationSessionHandoff | null>;
  syncElapsedSeconds: (elapsedSeconds: number) => void;
  dismissSession: () => void;
  registerControls: (controls: MeditationSessionControls | null) => () => void;
};

const MeditationSessionContext =
  createContext<MeditationSessionContextValue | null>(null);

const getDefaultTitle = (mode: MeditationSessionMode) => {
  switch (mode) {
    case "soundscape":
      return "Soundscape";
    case "anchor":
      return "Presence anchor";
    case "meditation":
    default:
      return "Meditation";
  }
};

export function MeditationSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(
    null
  );
  const [status, setStatus] = useState<MeditationSessionStatus>("idle");
  const controlsRef = useRef<MeditationSessionControls | null>(null);

  useEffect(() => {
    if (status !== "running") {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveSession((session) =>
        session
          ? {
              ...session,
              elapsedSeconds: session.elapsedSeconds + 1,
            }
          : session
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Native lock-screen controls can change playback without going through the
  // React buttons. Poll the registered player so the floating control stays in
  // sync when the app returns from the background.
  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    const interval = setInterval(() => {
      const isPlaying = controlsRef.current?.getIsPlaying?.();
      if (isPlaying === null || isPlaying === undefined) return;

      setStatus(isPlaying ? "running" : "paused");
    }, 500);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = useCallback((input: StartSessionInput) => {
    setActiveSession({
      mode: input.mode,
      source: input.source ?? input.mode,
      title: input.title ?? getDefaultTitle(input.mode),
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      goalSeconds: input.goalSeconds,
      checkInId: input.checkInId,
      date: input.date,
      contentId: input.contentId,
    });
    setStatus("running");
  }, []);

  const pauseSession = useCallback(async () => {
    if (status !== "running") return;

    // Update the floating control immediately. The registered player may need
    // to wait for a native playback-status event and/or an API response.
    setStatus("paused");
    await controlsRef.current?.onPause?.(activeSession?.elapsedSeconds ?? 0);
  }, [activeSession?.elapsedSeconds, status]);

  const resumeSession = useCallback(async () => {
    if (status !== "paused") return;

    setStatus("running");
    await controlsRef.current?.onResume?.();
  }, [status]);

  const stopSession = useCallback(async () => {
    const elapsedSeconds = activeSession?.elapsedSeconds ?? 0;
    await controlsRef.current?.onStop?.(elapsedSeconds);
    setActiveSession(null);
    setStatus("idle");
    controlsRef.current = null;
  }, [activeSession?.elapsedSeconds]);

  const prepareForContent = useCallback(
    async (contentId: string): Promise<MeditationSessionHandoff | null> => {
      if (!activeSession) return null;

      if (activeSession.contentId !== contentId) {
        // A different meditation replaces the current one. The registered
        // player completes the old backend session and releases its audio.
        await stopSession();
        return null;
      }

      // Reopening the same meditation transfers the existing session/audio
      // position to the new player instead of creating a duplicate session.
      const handoff = await controlsRef.current?.onTakeover?.();
      const result = handoff ?? {
        elapsedSeconds: activeSession.elapsedSeconds,
        wasPlaying: status === "running",
      };

      setActiveSession((session) =>
        session
          ? { ...session, elapsedSeconds: Math.max(0, Math.floor(result.elapsedSeconds)) }
          : session
      );
      setStatus(result.wasPlaying ? "running" : "paused");
      return result;
    }, [activeSession, status, stopSession]);

  const syncElapsedSeconds = useCallback((elapsedSeconds: number) => {
    if (!Number.isFinite(elapsedSeconds)) return;

    setActiveSession((session) =>
      session
        ? { ...session, elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)) }
        : session
    );
  }, []);

  // Clears the local floating-player state without invoking onStop. This is
  // used when a player screen is dismissed after pausing its server session;
  // an explicit Stop action still uses stopSession and completes the session.
  const dismissSession = useCallback(() => {
    setActiveSession(null);
    setStatus("idle");
    controlsRef.current = null;
  }, []);

  const registerControls = useCallback(
    (controls: MeditationSessionControls | null) => {
      controlsRef.current = controls;

      return () => {
        if (controlsRef.current === controls) {
          controlsRef.current = null;
        }
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      activeSession,
      status,
      isActive: Boolean(activeSession),
      startSession,
      pauseSession,
      resumeSession,
      stopSession,
      prepareForContent,
      syncElapsedSeconds,
      dismissSession,
      registerControls,
    }),
    [
      activeSession,
      pauseSession,
      registerControls,
      resumeSession,
      startSession,
      status,
      stopSession,
      prepareForContent,
      syncElapsedSeconds,
      dismissSession,
    ]
  );

  return (
    <MeditationSessionContext.Provider value={value}>
      {children}
    </MeditationSessionContext.Provider>
  );
}

export function useMeditationSession() {
  const context = useContext(MeditationSessionContext);

  if (!context) {
    throw new Error(
      "useMeditationSession must be used within a MeditationSessionProvider"
    );
  }

  return context;
}
