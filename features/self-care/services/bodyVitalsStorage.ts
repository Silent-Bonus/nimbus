import { StoreKey } from "@/constants/Constant";
import {
  getStoredUser,
  getStoredValue,
  removeStoredValue,
  setStoredValue,
} from "@/services/storageService";

import {
  clampHeightCm,
  formatFlexibleDecimal,
  parseMetricNumber,
} from "@/features/self-care/components/body-vitals/utils";
import type { SomaticGender } from "@/features/self-care/components/body-vitals/types";
import { normalizeBodyVitalsContext } from "@/features/self-care/services/bodyVitalsNormalizer";
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

export async function setStoredBodyVitalsContext(
  context: BodyVitalsContext | null
): Promise<void> {
  if (!context) {
    await removeStoredValue(BODY_VITALS_CONTEXT_KEY);
    return;
  }

  await setStoredValue(BODY_VITALS_CONTEXT_KEY, context);
}

export async function clearStoredBodyVitalsContext(): Promise<void> {
  await removeStoredValue(BODY_VITALS_CONTEXT_KEY);
}

export async function getStoredBodyVitalsContext(): Promise<BodyVitalsContext | null> {
  const cached = normalizeBodyVitalsContext(
    await getStoredValue(BODY_VITALS_CONTEXT_KEY)
  );

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
  const inputs = context?.inputs;
  const prefill = context?.prefill;
  const profile = context?.profile;
  const savedSummary = context?.saved_summary;

  const heightCm =
    toNumber(inputs?.height_cm) ??
    toNumber(prefill?.height_cm) ??
    toNumber(savedSummary?.height_cm) ??
    toNumber(profile?.height_cm);
  const weightKg =
    toNumber(inputs?.weight_kg) ??
    toNumber(prefill?.weight_kg) ??
    toNumber(savedSummary?.weight_kg) ??
    toNumber(profile?.weight_kg);
  const age =
    toNumber(inputs?.age) ??
    toNumber(prefill?.age) ??
    toNumber(savedSummary?.age) ??
    toNumber(profile?.age);

  const gender = toSomaticGender(
    inputs?.gender ?? prefill?.gender ?? savedSummary?.gender ?? profile?.gender,
    inputs?.gender_prefer_not_to_say ??
      prefill?.gender_prefer_not_to_say ??
      savedSummary?.gender_prefer_not_to_say ??
      profile?.gender_prefer_not_to_say,
    fallback.gender
  );

  const activityLevel = toActivityLevel(
    inputs?.activity_level ?? prefill?.activity_level ?? profile?.activity_level,
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
