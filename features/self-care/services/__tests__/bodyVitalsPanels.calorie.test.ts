import {
  FALLBACK_CALORIE_PANEL_DATA,
  buildCaloriePanelRouteParams,
  buildCaloriePanelTiers,
  resolveCaloriePanelDataFromContext,
  resolveCaloriePanelDataFromParams,
} from "../body-vitals/panels";

describe("bodyVitals panels: calorie", () => {
  it("maps the calorie goal from the vitals context", () => {
    const data = resolveCaloriePanelDataFromContext({
      profile: {
        calorie_goal: {
          total_calorie: 1949,
          maintenance_calories: 2199,
          optimal_burn_calories: 1949,
          unit: "kcal",
          maintaince: 2199,
          burn: 1949,
          build: 2449,
          tip: "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
        },
      },
    });

    expect(data).toEqual({
      totalCalorie: 1949,
      maintenanceCalories: 2199,
      optimalBurnCalories: 1949,
      buildCalories: 2449,
      unit: "kcal",
      tip: "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
      source: "api",
    });
  });

  it("falls back to mock calorie data when no saved values exist", () => {
    expect(resolveCaloriePanelDataFromContext(null)).toEqual(
      FALLBACK_CALORIE_PANEL_DATA
    );
  });

  it("builds route params and tiers from the resolved calorie data", () => {
    const data = resolveCaloriePanelDataFromParams({
      total_calorie: "1949",
      maintenance_calories: "2199",
      optimal_burn_calories: "1949",
      build: "2449",
      unit: "kcal",
      tip: "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
    });

    expect(buildCaloriePanelRouteParams(data)).toEqual({
      total_calorie: "1949",
      maintenance_calories: "2199",
      optimal_burn_calories: "1949",
      build: "2449",
      unit: "kcal",
      tip: "This is a larger deficit. Watch recovery, hunger, and training performance closely.",
      calories: "1949",
      maintenanceCalories: "2199",
      targetCalories: "1949",
      maintenance: "2199",
      burn: "1949",
    });

    expect(buildCaloriePanelTiers(data)).toEqual([
      {
        key: "maintenance",
        label: "METABOLIC FLUX",
        title: "Maintenance",
        calories: 2199,
      },
      {
        key: "burn",
        label: "OPTIMAL IGNITION",
        title: "Burn (Fat Loss)",
        calories: 1949,
        highlight: true,
      },
      {
        key: "build",
        label: "STRUCTURAL GROWTH",
        title: "Build (Muscle)",
        calories: 2449,
      },
    ]);
  });
});
