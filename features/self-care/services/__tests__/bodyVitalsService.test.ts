import { buildBodyVitalsUpdatePayload } from "../bodyVitalsService";

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
});
