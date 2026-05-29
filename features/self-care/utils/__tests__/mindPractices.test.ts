import {
  AFFIRMATION_CARDS,
  BREATH_PATTERNS,
  getBreathMotionVariant,
  filterBreathPatterns,
  filterAffirmations,
  formatAffirmationToneLabel,
  formatBreathCadence,
  formatBreathToneLabel,
} from "../mindPractices";

describe("mindPractices", () => {
  it("filters affirmations by tone and formats the tone label", () => {
    const confidence = filterAffirmations(AFFIRMATION_CARDS, "confidence");

    expect(confidence).toHaveLength(2);
    expect(confidence.every((item) => item.tone === "confidence")).toBe(true);
    expect(formatAffirmationToneLabel("sleep")).toBe("Sleep");
  });

  it("formats breath cadences for the active pattern", () => {
    expect(BREATH_PATTERNS[0].title).toBe("Box Breath");
    expect(formatBreathCadence(BREATH_PATTERNS[0])).toBe("4 - 4 - 4 - 4");
    expect(formatBreathToneLabel("release")).toBe("Release");
    expect(filterBreathPatterns(BREATH_PATTERNS, "steady")).toHaveLength(1);
  });

  it("maps breath patterns to the intended motion variant", () => {
    expect(getBreathMotionVariant("box-breath")).toBe("box");
    expect(getBreathMotionVariant("coherent-breath")).toBe("orb");
    expect(getBreathMotionVariant("release-breath")).toBe("orb");
    expect(getBreathMotionVariant("sleep-breath")).toBe("box");
  });
});
