import {
  buildBodyVitalsCalculatorPayload,
  buildBodyShapeCalculationPayload,
  buildBodyVitalsProfilePatchPayload,
  buildBodyVitalsSummaryPayload,
  buildBodyVitalsUpdatePayload,
  mergeBodyVitalsCalculationResponses,
  normalizeBodyVitalsCalculationResponse,
} from "../bodyVitalsService";

describe("bodyVitalsService", () => {
  it("builds the patch payload from the current form and saved vitals context", () => {
    const payload = buildBodyVitalsUpdatePayload(
      {
        gender: "feminine",
        age: "",
        weight: "",
        height: "",
        activityLevel: 0.68,
      },
      {
        prefill: {
          gender: "female",
          age: 28,
          weight_kg: 64.5,
          height_cm: 172,
          activity_level: "active",
        },
      }
    );

    expect(payload).toEqual({
      calculation_type: "all",
      save_to_profile: true,
      vitals: {
        gender: "female",
        age: 28,
        weight_kg: 64.5,
        height_cm: 172,
        activity_level: "active",
      },
    });
  });

  it("rounds values from the active form before sending them to the profile patch", () => {
    const payload = buildBodyVitalsUpdatePayload(
      {
        gender: "masculine",
        age: "28.9",
        weight: "64.44",
        height: "171.7",
        activityLevel: 0.85,
      },
      null
    );

    expect(payload.vitals).toEqual({
      gender: "male",
      age: 29,
      weight_kg: 64.4,
      height_cm: 172,
      activity_level: "optimal",
    });
  });

  it("builds the summary calculator payload", () => {
    const payload = buildBodyVitalsSummaryPayload();

    expect(payload).toEqual({
      calculation_type: "all",
      save_to_profile: true,
    });
  });

  it("builds the protein calculator payload without gender", () => {
    const payload = buildBodyVitalsCalculatorPayload(
      {
        gender: "feminine",
        age: "",
        weight: "",
        height: "",
        activityLevel: 0.68,
      },
      {
        prefill: {
          gender: "female",
          age: 28,
          weight_kg: 64.5,
          height_cm: 172,
          activity_level: "active",
        },
      },
      "protein"
    );

    expect(payload).toEqual({
      calculation_type: "protein",
      save_to_profile: true,
      vitals: {
        age: 28,
        weight_kg: 64.5,
        height_cm: 172,
        activity_level: "active",
      },
    });
  });

  it("builds the profile patch payload from the normalized form values", () => {
    const payload = buildBodyVitalsProfilePatchPayload(
      {
        gender: "feminine",
        age: "28.9",
        weight: "65.95",
        height: "172.6",
        activityLevel: 0.68,
      },
      null
    );

    expect(payload).toEqual({
      age: 29,
      height_cm: 173,
      weight_kg: 66,
      gender: "female",
      activity_level: "active",
    });
  });

  it("builds the body shape calculator payload from measurements", () => {
    const payload = buildBodyShapeCalculationPayload({
      bust_cm: 92,
      waist_cm: 71,
      high_hip_cm: 88,
      low_hip_cm: 101,
    }, {
      inputs: {
        gender: "female",
        age: 28,
        weight_kg: 64.5,
        height_cm: 172,
        activity_level: "active",
      },
    });

    expect(payload).toEqual({
      calculation_type: "body_shape",
      save_to_profile: true,
      vitals: {
        gender: "female",
        age: 28,
        weight_kg: 64.5,
        height_cm: 172,
        activity_level: "moderate",
        measurements: {
          bust_cm: 92,
          waist_cm: 71,
          high_hip_cm: 88,
          low_hip_cm: 101,
        },
      },
    });
  });

  it("normalizes the temporary protein response into the final shape", () => {
    const normalized = normalizeBodyVitalsCalculationResponse(
      {
        success: true,
        message: "Vitals calculated successfully.",
        data: {
          status: "success",
          saved_to_profile: true,
          protein_target_g: 108,
          protein_per_meal_g: 27,
          diet_goal: {
            carbs_goal: null,
            fats_goal: null,
            fiber_goal: null,
            tip: "Keep carbs around training, keep fats moderate, and aim for at least 14 g fiber per 1000 kcal.",
          },
          body_shape: null,
          metabolic_insight:
            "Aim for consistent protein at each meal to support muscle maintenance.",
          formula_version: "lbm-v1",
        },
      },
      "protein",
      {
        latest_snapshot: {
          outputs: {
            bmr: 1419,
            calorie_goal: {
              maintenance_calories: 2199,
              optimal_burn_calories: 1949,
              build_calories: 2449,
            },
            body_shape: {
              code: "pear_hourglass_hybrid",
              label: "Pear / Hourglass Hybrid",
            },
          },
        },
      }
    );

    expect(normalized).toEqual({
      success: true,
      message: "Vitals calculated successfully.",
      data: {
        status: "success",
        saved_to_profile: true,
        recalculated_modules: ["protein"],
        reused_modules: ["calories", "diet", "body_shape"],
        results: {
          bmr: 1419,
          protein_goal: expect.objectContaining({
            protein_target_g: 108,
            protein_per_meal_g: 27,
          }),
          calorie_goal: expect.objectContaining({
            maintenance_calories: 2199,
            optimal_burn_calories: 1949,
            build_calories: 2449,
          }),
          diet_goal: expect.objectContaining({
            carbs_goal: 233,
            fats_goal: 65,
            fiber_goal: 27,
          }),
          body_shape: expect.objectContaining({
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
          }),
          metabolic_insight:
            "Aim for consistent protein at each meal to support muscle maintenance.",
        },
      },
    });
  });

  it("normalizes the summary response into the final shape", () => {
    const normalized = normalizeBodyVitalsCalculationResponse({
      success: true,
      message: "Vitals calculated successfully.",
      data: {
        status: "success",
        saved_to_profile: true,
        results: {
          bmr: 1419,
          protein_goal: {
            protein_target_g: 108,
            protein_per_meal_g: 27,
          },
          calorie_goal: {
            maintenance_calories: 2199,
            optimal_burn_calories: 1949,
            build_calories: 2449,
          },
          body_shape: {
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
          },
        },
      },
    }, "all");

    expect(normalized).toEqual({
      success: true,
      message: "Vitals calculated successfully.",
      data: {
        status: "success",
        saved_to_profile: true,
        recalculated_modules: ["protein", "calories", "diet", "body_shape"],
        reused_modules: [],
        results: {
          bmr: 1419,
          protein_goal: expect.objectContaining({
            protein_target_g: 108,
            protein_per_meal_g: 27,
          }),
          calorie_goal: expect.objectContaining({
            maintenance_calories: 2199,
            optimal_burn_calories: 1949,
            build_calories: 2449,
          }),
          diet_goal: expect.objectContaining({
            carbs_goal: 233,
            fats_goal: 65,
            fiber_goal: 27,
          }),
          body_shape: expect.objectContaining({
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
          }),
          metabolic_insight: null,
        },
      },
    });
  });

  it("normalizes the temporary body shape response into the final shape", () => {
    const normalized = normalizeBodyVitalsCalculationResponse(
      {
        success: true,
        message: "Vitals calculated successfully.",
        data: {
          status: "success",
          saved_to_profile: true,
          body_shape: {
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
            confidence: 0.86,
            movement_strategy:
              "Blend glute activation with core work and balanced upper-body volume.",
            measurements: {
              bust_cm: 92,
              waist_cm: 71,
              high_hip_cm: 88,
              low_hip_cm: 101,
            },
          },
          metabolic_insight:
            "Your body blueprint reads as pear / hourglass hybrid. Blend glute activation with core work and balanced upper-body volume.",
        },
      },
      "body_shape"
    );

    expect(normalized).toEqual({
      success: true,
      message: "Vitals calculated successfully.",
      data: {
        status: "success",
        saved_to_profile: true,
        recalculated_modules: ["body_shape"],
        reused_modules: ["protein", "calories", "diet"],
        results: {
          bmr: 1419,
          protein_goal: expect.objectContaining({
            protein_target_g: 108,
            protein_per_meal_g: 27,
          }),
          calorie_goal: expect.objectContaining({
            maintenance_calories: 2199,
            optimal_burn_calories: 1949,
            build_calories: 2449,
          }),
          diet_goal: expect.objectContaining({
            carbs_goal: 233,
            fats_goal: 65,
            fiber_goal: 27,
          }),
          body_shape: expect.objectContaining({
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
            confidence: 0.86,
            measurements: {
              bust_cm: 92,
              waist_cm: 71,
              high_hip_cm: 88,
              low_hip_cm: 101,
            },
          }),
          metabolic_insight:
            "Your body blueprint reads as pear / hourglass hybrid. Blend glute activation with core work and balanced upper-body volume.",
        },
      },
    });
  });

  it("merges normalized protein and calorie responses into one final result", () => {
    const merged = mergeBodyVitalsCalculationResponses(
      {
        success: true,
        message: "protein",
        data: {
          status: "success",
          saved_to_profile: true,
          recalculated_modules: ["protein"],
          reused_modules: ["calories", "diet", "body_shape"],
          results: {
            protein_goal: {
              protein_target_g: 108,
              protein_per_meal_g: 27,
            },
          },
        },
      },
      {
        success: true,
        message: "calories",
        data: {
          status: "success",
          saved_to_profile: true,
          recalculated_modules: ["calories", "diet"],
          reused_modules: ["protein", "body_shape"],
          results: {
            bmr: 1419,
            calorie_goal: {
              maintenance_calories: 2199,
              optimal_burn_calories: 1949,
              build_calories: 2449,
            },
            diet_goal: {
              carbs_goal: 233,
              fats_goal: 65,
              fiber_goal: 27,
            },
            body_shape: {
              code: "pear_hourglass_hybrid",
              label: "Pear / Hourglass Hybrid",
            },
          },
        },
      }
    );

    expect(merged).toEqual({
      success: true,
      message: "calories",
      data: {
        status: "success",
        saved_to_profile: true,
        recalculated_modules: ["protein", "calories", "diet"],
        reused_modules: ["body_shape"],
        results: {
          bmr: 1419,
          protein_goal: {
            protein_target_g: 108,
            protein_per_meal_g: 27,
          },
          calorie_goal: {
            maintenance_calories: 2199,
            optimal_burn_calories: 1949,
            build_calories: 2449,
          },
          diet_goal: {
            carbs_goal: 233,
            fats_goal: 65,
            fiber_goal: 27,
          },
          body_shape: {
            code: "pear_hourglass_hybrid",
            label: "Pear / Hourglass Hybrid",
          },
          metabolic_insight: null,
        },
      },
    });
  });
});
