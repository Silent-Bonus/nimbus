import { createWellnessSession } from "@/features/self-care/services/wellnessSessionService";
import type {
  WellnessSessionCreateResponse,
  WellnessSessionRequest,
} from "@/features/self-care/types/selfCareTypes";

type LaunchKey = string;

type LaunchOptions = {
  maxRetries?: number;
};

const launchedSessionRefs = new Map<LaunchKey, string>();
const pendingLaunches = new Map<LaunchKey, Promise<string | null>>();

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const createWellnessSessionLaunchKey = (scope: string) =>
  `${scope}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createWellnessSessionWithRetry = async (
  payload: WellnessSessionRequest,
  maxRetries: number
): Promise<string | null> => {
  const attempts = Math.max(1, maxRetries + 1);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response: WellnessSessionCreateResponse = await createWellnessSession(
        payload
      );

      return response.data.session_ref;
    } catch (error) {
      if (attempt === attempts - 1) {
        console.warn("Unable to create wellness session after retries:", error);
        return null;
      }

      await sleep(500 * (attempt + 1));
    }
  }

  return null;
};

export const launchWellnessSessionInBackground = (
  launchKey: LaunchKey,
  payload: WellnessSessionRequest,
  options: LaunchOptions = {}
) => {
  if (launchedSessionRefs.has(launchKey)) {
    return pendingLaunches.get(launchKey) ?? Promise.resolve(launchedSessionRefs.get(launchKey) ?? null);
  }

  const existing = pendingLaunches.get(launchKey);
  if (existing) {
    return existing;
  }

  const promise = createWellnessSessionWithRetry(payload, options.maxRetries ?? 3)
    .then((sessionRef) => {
      if (sessionRef) {
        launchedSessionRefs.set(launchKey, sessionRef);
      }

      return sessionRef;
    })
    .finally(() => {
      pendingLaunches.delete(launchKey);
    });

  pendingLaunches.set(launchKey, promise);
  return promise;
};

export const getLaunchedWellnessSessionRef = (launchKey: LaunchKey) =>
  launchedSessionRefs.get(launchKey);

export const waitForLaunchedWellnessSessionRef = async (
  launchKey: LaunchKey,
  timeoutMs = 15000
) => {
  const cached = getLaunchedWellnessSessionRef(launchKey);
  if (cached) {
    return cached;
  }

  const pending = pendingLaunches.get(launchKey);
  if (!pending) {
    return undefined;
  }

  if (timeoutMs <= 0) {
    return (await pending) ?? undefined;
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      pending,
      new Promise<undefined>((resolve) => {
        timeoutHandle = setTimeout(() => resolve(undefined), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export const resolveWellnessSessionRef = async ({
  launchKey,
  sessionRef,
  timeoutMs = 15000,
}: {
  launchKey?: string | null;
  sessionRef?: string | null;
  timeoutMs?: number;
}) => {
  if (sessionRef) {
    return sessionRef;
  }

  if (!launchKey) {
    return undefined;
  }

  return waitForLaunchedWellnessSessionRef(launchKey, timeoutMs);
};

export const clearLaunchedWellnessSessions = () => {
  launchedSessionRefs.clear();
  pendingLaunches.clear();
};
