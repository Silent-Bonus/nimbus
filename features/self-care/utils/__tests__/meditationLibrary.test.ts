import {
  buildMeditationFilterOptions,
  buildMeditationRouteParams,
  filterMeditationTemplates,
  hydrateMeditationTemplate,
  mapMeditationTemplate,
  mockMeditationRecommendations,
} from "../meditationLibrary";

describe("meditationLibrary", () => {
  it("maps raw meditation items into premium template data", () => {
    const template = mapMeditationTemplate(
      {
        id: 19,
        slug: "moon-breath",
        title: "Moon Breath",
        description: "Slow the inhale and exhale until the room softens.",
        category: "breathwork",
        duration: 6,
        source: "https://example.com/moon-breath.mp3",
      },
      0
    );

    expect(template.id).toBe("moon-breath");
    expect(template.slug).toBe("moon-breath");
    expect(template.title).toBe("Moon Breath");
    expect(template.durationLabel).toBe("6 min");
    expect(template.tags).toContain("breath");
    expect(template.source).toBe("https://example.com/moon-breath.mp3");
  });

  it("normalizes API wellness content into meditation templates and route params", () => {
    const template = mapMeditationTemplate(
      {
        id: 1,
        slug: "relaxing-meditation",
        title: "Relaxing Meditation",
        modality: "meditation",
        category: "Relaxation",
        duration: "2.5 min",
        image: "https://example.com/relaxing.png",
        rating: 4.9,
        reviews: 128,
        tags: ["Calm", "Vata Balancing", "Vedic Wisdom", "Visualization"],
        level: "Beginner",
        dosha: "Vata",
      },
      0
    );

    const params = buildMeditationRouteParams(template);
    const hydrated = hydrateMeditationTemplate(params, template);

    expect(template.id).toBe("relaxing-meditation");
    expect(template.slug).toBe("relaxing-meditation");
    expect(template.durationLabel).toBe("2.5 min");
    expect(template.tag).toBe("calm");
    expect(template.tags).toContain("calm");
    expect(template.tags).toContain("vata-balancing");
    expect(template.level).toBe("Beginner");
    expect(template.dosha).toBe("Vata");
    expect(template.rating).toBe(4.9);
    expect(template.reviews).toBe(128);
    expect(params.meditationId).toBe("relaxing-meditation");
    expect(params.meditationImage).toBe("https://example.com/relaxing.png");
    expect(hydrated.title).toBe("Relaxing Meditation");
    expect(hydrated.durationLabel).toBe("2.5 min");
  });

  it("builds unique filters and filters templates by tag", () => {
    const options = buildMeditationFilterOptions(mockMeditationRecommendations);

    expect(options[0]).toEqual({ label: "All Modes", value: "all" });
    expect(options.some((option) => option.value === "sleep")).toBe(true);

    const visible = filterMeditationTemplates(
      mockMeditationRecommendations,
      "sleep"
    );

    expect(visible).toHaveLength(1);
    expect(visible[0].title).toBe("Sleep Drift");
  });
});
