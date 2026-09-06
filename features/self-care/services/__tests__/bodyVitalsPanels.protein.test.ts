import {
  FALLBACK_PROTEIN_PANEL_DATA,
  buildProteinPanelMealSlots,
  buildProteinPanelRouteParams,
  resolveProteinPanelDataFromContext,
  resolveProteinPanelDataFromParams,
} from "../body-vitals/panels";

describe("bodyVitals panels: protein", () => {
  it("maps the protein goal from the vitals context", () => {
    const data = resolveProteinPanelDataFromContext({
      profile: {
        protein_goal: {
          total_requirement: 124,
          meal_one: 29,
          meal_two: 34,
          meal_three: 28,
          unit: "gm",
          tip: "Anchor each meal with a clear protein source.",
        },
      },
    });

    expect(data).toEqual({
      totalRequirement: 124,
      mealOne: 29,
      mealTwo: 34,
      mealThree: 28,
      unit: "gm",
      tip: "Anchor each meal with a clear protein source.",
      source: "api",
    });
  });

  it("falls back to the mock protein data when the API payload is missing", () => {
    expect(resolveProteinPanelDataFromContext(null)).toEqual(
      FALLBACK_PROTEIN_PANEL_DATA
    );
  });

  it("builds route params and meal slots from the resolved data", () => {
    const data = resolveProteinPanelDataFromParams({
      total_requirement: "140",
      meal_one: "35",
      meal_two: "45",
      meal_three: "60",
      unit: "g",
      tip: "Keep meals protein-forward.",
    });

    expect(buildProteinPanelRouteParams(data)).toEqual({
      protein: "140",
      total_requirement: "140",
      meal_one: "35",
      meal_two: "45",
      meal_three: "60",
      unit: "g",
      tip: "Keep meals protein-forward.",
    });

    expect(buildProteinPanelMealSlots(data)).toEqual([
      { key: "meal-1", label: "MEAL 1", grams: 35 },
      { key: "meal-2", label: "MEAL 2", grams: 45 },
      { key: "meal-3", label: "MEAL 3", grams: 60 },
    ]);
  });

  it("marks protein-only route params as API-backed data", () => {
    expect(
      resolveProteinPanelDataFromParams({
        protein: "135",
      }).source
    ).toBe("api");
  });
});
