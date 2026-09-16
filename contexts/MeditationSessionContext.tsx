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

    await controlsRef.current?.onPause?.(activeSession?.elapsedSeconds ?? 0);
    setStatus("paused");
  }, [activeSession?.elapsedSeconds, status]);

  const resumeSession = useCallback(async () => {
    if (status !== "paused") return;

    await controlsRef.current?.onResume?.();
    setStatus("running");
  }, [status]);

  const stopSession = useCallback(async () => {
    const elapsedSeconds = activeSession?.elapsedSeconds ?? 0;
    await controlsRef.current?.onStop?.(elapsedSeconds);
    setActiveSession(null);
    setStatus("idle");
    controlsRef.current = null;
  }, [activeSession?.elapsedSeconds]);

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
