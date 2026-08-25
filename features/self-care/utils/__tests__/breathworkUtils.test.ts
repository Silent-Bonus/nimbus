import {
  createFallbackBreathPattern,
  filterBreathPatterns,
  formatBreathCadence,
  formatBreathStyleLabel,
  getBreathMotionVariant,
} from "../breathworkUtils";

describe("breathworkUtils", () => {
  it("formats breath cadences for the active pattern", () => {
    const groundingPattern = createFallbackBreathPattern("grounding");
    const steadyPattern = createFallbackBreathPattern("steady");

    expect(groundingPattern.title).toBe("Box Breath");
    expect(formatBreathCadence(groundingPattern)).toBe("4 - 4 - 4 - 4");
    expect(formatBreathStyleLabel("release")).toBe("Release");
    expect(
      filterBreathPatterns([groundingPattern, steadyPattern], "steady")
    ).toHaveLength(1);
  });

  it("maps breath patterns to the intended motion variant", () => {
    expect(getBreathMotionVariant("box-breath")).toBe("box");
    expect(getBreathMotionVariant("coherent-breath")).toBe("orb");
    expect(getBreathMotionVariant("release-breath")).toBe("orb");
    expect(getBreathMotionVariant("sleep-breath")).toBe("box");
    expect(getBreathMotionVariant("Box Breathing")).toBe("box");
    expect(getBreathMotionVariant("Calm Reset")).toBe("orb");
    expect(getBreathMotionVariant("Night Drift")).toBe("box");
  });
});
