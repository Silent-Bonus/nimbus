import type { AffirmationCard } from "../../types/affirmation";
import {
  buildAffirmationFilters,
  filterAffirmations,
  formatAffirmationToneLabel,
  resolveAffirmationTone,
  resolveAffirmationToneFromTags,
} from "../affirmationHelpers";

describe("affirmationHelpers", () => {
  it("filters affirmations by tone and formats the tone label", () => {
    const items: AffirmationCard[] = [
      {
        id: "steady-breath",
        title: "Quiet Ground",
        tone: "Calmness",
        toneCategory: "calm",
        quote: "I can move slowly and still arrive with clarity.",
        detail: "A gentle reset for days that feel too loud.",
      },
      {
        id: "clear-steps",
        title: "Clear Path",
        tone: "Confidence",
        toneCategory: "confidence",
        quote: "My next step does not need to be perfect to be enough.",
        detail: "Use this when the mind wants to over-edit the moment.",
      },
      {
        id: "quiet-power",
        title: "Steady Flame",
        tone: "Confidence",
        toneCategory: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
      },
    ];

    const confidence = filterAffirmations(items, "Confidence");
    const filters = buildAffirmationFilters(items);

    expect(confidence).toHaveLength(2);
    expect(confidence.every((item) => item.tone === "Confidence")).toBe(true);
    expect(filters).toEqual([
      { label: "All", value: "all" },
      { label: "Calmness", value: "Calmness" },
      { label: "Confidence", value: "Confidence" },
    ]);
    expect(formatAffirmationToneLabel("sleep")).toBe("Sleep");
  });

  it("resolves tone categories from api tone and tags", () => {
    expect(resolveAffirmationTone("Calmness", ["focus"])).toBe("calm");
    expect(resolveAffirmationTone("wealth", [])).toBe("confidence");
    expect(resolveAffirmationTone("", ["rejuvenation"])).toBe("reset");
    expect(resolveAffirmationTone("", ["night"])).toBe("sleep");
  });

  it("resolves a create tone from normalized tags", () => {
    expect(resolveAffirmationToneFromTags(["focus", "study"])).toBe(
      "confidence"
    );
    expect(resolveAffirmationToneFromTags(["rest"])).toBe("sleep");
    expect(resolveAffirmationToneFromTags(["fresh", "clear"])).toBe("reset");
  });
});
