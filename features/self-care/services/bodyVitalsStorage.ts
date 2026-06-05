import AsyncStorage from "@react-native-async-storage/async-storage";

import { StoreKey } from "@/constants/Constant";
import { getStoredUser } from "@/services/storageService";

import {
  clampHeightCm,
  formatFlexibleDecimal,
  parseMetricNumber,
} from "@/features/self-care/components/body-vitals/utils";
import type { SomaticGender } from "@/features/self-care/components/body-vitals/types";
import type {
  BodyVitalsActivityLevel,
  BodyVitalsContext,
  BodyVitalsFormState,
} from "@/features/self-care/types/bodyVitals";

const BODY_VITALS_CONTEXT_KEY = StoreKey.BODY_VITALS_CONTEXT_KEY;

export const DEFAULT_BODY_VITALS_FORM: BodyVitalsFormState = {
  gender: "masculine",
  age: "32",
  weight: "74.5",
  height: "182",
  activityLevel: 0.68,
};

const ACTIVITY_LEVEL_VALUES: Record<string, number> = {
  sedentary: 0.2,
  active: 0.55,
  optimal: 0.85,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return null;
}

function toSomaticGender(
  gender: unknown,
  preferNotToSay: unknown,
  fallback: SomaticGender = DEFAULT_BODY_VITALS_FORM.gender
): SomaticGender {
  if (typeof gender === "string") {
    const normalizedGender = gender.trim().toLowerCase();
    if (normalizedGender === "female" || normalizedGender === "feminine") {
      return "feminine";
    }
    if (normalizedGender === "male" || normalizedGender === "masculine") {
      return "masculine";
    }
  }

  if (toBoolean(preferNotToSay)) {
    return fallback;
  }

  return fallback;
}

function toActivityLevel(
  value: BodyVitalsActivityLevel | null | undefined,
  fallback = DEFAULT_BODY_VITALS_FORM.activityLevel
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized in ACTIVITY_LEVEL_VALUES) {
      return ACTIVITY_LEVEL_VALUES[normalized];
    }

    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function normalizeBodyVitalsContext(raw: unknown): BodyVitalsContext | null {
  return isRecord(raw) ? (raw as BodyVitalsContext) : null;
}

export async function setStoredBodyVitalsContext(
  context: BodyVitalsContext | null
): Promise<void> {
  if (!context) {
    await AsyncStorage.removeItem(BODY_VITALS_CONTEXT_KEY);
    return;
  }

  await AsyncStorage.setItem(BODY_VITALS_CONTEXT_KEY, JSON.stringify(context));
}

export async function clearStoredBodyVitalsContext(): Promise<void> {
  await AsyncStorage.removeItem(BODY_VITALS_CONTEXT_KEY);
}

export async function getStoredBodyVitalsContext(): Promise<BodyVitalsContext | null> {
  const cachedRaw = await AsyncStorage.getItem(BODY_VITALS_CONTEXT_KEY);
  let cached: BodyVitalsContext | null = null;

  try {
    cached = normalizeBodyVitalsContext(cachedRaw ? JSON.parse(cachedRaw) : null);
  } catch {
    cached = null;
  }

  if (cached) {
    return cached;
  }

  const storedUser = await getStoredUser();
  const storedContext = normalizeBodyVitalsContext(storedUser?.vitals_context);
  if (!storedContext) {
    return null;
  }

  await setStoredBodyVitalsContext(storedContext);
  return storedContext;
}

export async function syncStoredBodyVitalsContext(source: {
  vitals_context?: unknown;
} | null | undefined): Promise<void> {
  if (!source) {
    await clearStoredBodyVitalsContext();
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(source, "vitals_context")) {
    return;
  }

  await setStoredBodyVitalsContext(
    normalizeBodyVitalsContext(source.vitals_context)
  );
}

export function resolveBodyVitalsFormState(
  context: BodyVitalsContext | null | undefined,
  fallback: BodyVitalsFormState = DEFAULT_BODY_VITALS_FORM
): BodyVitalsFormState {
  const prefill = context?.prefill;
  const profile = context?.profile;
  const savedSummary = context?.saved_summary;

  const heightCm =
    toNumber(prefill?.height_cm) ??
    toNumber(savedSummary?.height_cm) ??
    toNumber(profile?.height_cm);
  const weightKg =
    toNumber(prefill?.weight_kg) ??
    toNumber(savedSummary?.weight_kg) ??
    toNumber(profile?.weight_kg);
  const age =
    toNumber(prefill?.age) ?? toNumber(savedSummary?.age) ?? toNumber(profile?.age);

  const gender = toSomaticGender(
    prefill?.gender ?? savedSummary?.gender ?? profile?.gender,
    prefill?.gender_prefer_not_to_say ??
      savedSummary?.gender_prefer_not_to_say ??
      profile?.gender_prefer_not_to_say,
    fallback.gender
  );

  const activityLevel = toActivityLevel(
    prefill?.activity_level ?? profile?.activity_level,
    fallback.activityLevel
  );

  return {
    gender,
    age: String(Math.round(age ?? parseMetricNumber(fallback.age, 32))),
    weight: formatFlexibleDecimal(
      weightKg ?? parseMetricNumber(fallback.weight, 74.5),
      1
    ),
    height: String(
      clampHeightCm(
        Math.round(heightCm ?? parseMetricNumber(fallback.height, 182))
      )
    ),
    activityLevel,
  };
}
