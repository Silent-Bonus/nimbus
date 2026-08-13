import type { AffirmationCard } from "../../types/affirmation";
import {
  buildAffirmationRecommendations,
  buildAffirmationStorySlides,
  getAffirmationRecommendationPalette,
  limitWords,
} from "../affirmationPresentation";

const SAMPLE_CARDS: AffirmationCard[] = [
  {
    id: "calm-1",
    title: "Quiet Ground",
    tone: "Calmness",
    toneCategory: "calm",
    quote: "I can move slowly and still arrive with clarity.",
    storyQuote:
      "I can move slowly and still arrive with clarity.\nPeace builds in each breath.",
    detail: "A gentle reset for days that feel too loud.",
  },
  {
    id: "confidence-1",
    title: "Clear Path",
    tone: "Confidence",
    toneCategory: "confidence",
    quote: "My next step does not need to be perfect to be enough.",
    detail: "Use this when the mind wants to over-edit the moment.",
  },
  {
    id: "reset-1",
    title: "Soft Return",
    tone: "Health",
    toneCategory: "reset",
    quote: "Every breath gives me a clean way back to myself.",
    detail: "A simple line to come back to when attention drifts.",
  },
  {
    id: "sleep-1",
    title: "Rest Mode",
    tone: "Sleep",
    toneCategory: "sleep",
    quote: "Rest is part of the work, not a pause from it.",
    detail: "A quiet reminder for evening or recovery.",
  },
  {
    id: "calm-2",
    title: "Open Space",
    tone: "Calmness",
    toneCategory: "calm",
    quote: "I can make room for what is true without forcing it.",
    detail: "Let the shoulders soften before making a decision.",
  },
];

describe("affirmationPresentation", () => {
  it("builds recommendation cards from the first item in each tone", () => {
    const recommendations = buildAffirmationRecommendations(SAMPLE_CARDS);

    expect(recommendations.map((item) => item.id)).toEqual([
      "calm-1",
      "confidence-1",
      "reset-1",
      "sleep-1",
    ]);
    expect(recommendations[0].affirmation).toContain("Peace builds in each breath.");
    expect(recommendations[1].palette).toEqual(
      getAffirmationRecommendationPalette("confidence")
    );
  });

  it("builds story slides from the full card list", () => {
    const slides = buildAffirmationStorySlides(SAMPLE_CARDS);

    expect(slides).toHaveLength(5);
    expect(slides[4].id).toBe("calm-2");
    expect(slides[4].title).toBe("Open Space");
  });

  it("trims long copy to the requested number of words", () => {
    const result = limitWords(
      "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty one",
      20
    );

    expect(result.endsWith("…")).toBe(true);
    expect(result.split(/\s+/).filter(Boolean)).toHaveLength(20);
  });
});
