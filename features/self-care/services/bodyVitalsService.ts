import {
  clampHeightCm,
  getActivityOption,
  parseMetricNumber,
} from "@/features/self-care/components/body-vitals/utils";
import type { BodyVitalsContext, BodyVitalsFormState, BodyVitalsUpdatePayload } from "@/features/self-care/types/bodyVitals";

import { DEFAULT_BODY_VITALS_FORM, resolveBodyVitalsFormState } from "./bodyVitalsStorage";

export function mapSomaticGenderToApiGender(
  gender: BodyVitalsFormState["gender"]
) {
  return gender === "feminine" ? "female" : "male";
}

export function buildBodyVitalsUpdatePayload(
  form: BodyVitalsFormState,
  savedContext: BodyVitalsContext | null
): BodyVitalsUpdatePayload {
  const fallback = resolveBodyVitalsFormState(
    savedContext,
    DEFAULT_BODY_VITALS_FORM
  );

  const age = parseMetricNumber(
    form.age,
    parseMetricNumber(fallback.age, parseMetricNumber(DEFAULT_BODY_VITALS_FORM.age, 32))
  );
  const weightKg = parseMetricNumber(
    form.weight,
    parseMetricNumber(
      fallback.weight,
      parseMetricNumber(DEFAULT_BODY_VITALS_FORM.weight, 74.5)
    )
  );
  const heightCm = clampHeightCm(
    parseMetricNumber(
      form.height,
      parseMetricNumber(
        fallback.height,
        parseMetricNumber(DEFAULT_BODY_VITALS_FORM.height, 182)
      )
    )
  );

  return {
    calculation_type: "all",
    save_to_profile: true,
    vitals: {
      gender: mapSomaticGenderToApiGender(form.gender),
      age: Math.round(age),
      weight_kg: Number(weightKg.toFixed(1)),
      height_cm: Math.round(heightCm),
      activity_level: getActivityOption(form.activityLevel).key,
    },
  };
}
