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

    expect(template.id).toBe("19");
    expect(template.slug).toBe("moon-breath");
    expect(template.title).toBe("Moon Breath");
    expect(template.durationLabel).toBe("6 min");
    expect(template.tags).toContain("breath");
    expect(template.source).toBe("https://example.com/moon-breath.mp3");
  });

  it("normalizes detailed wellness content into meditation templates and route params", () => {
    const template = mapMeditationTemplate(
      {
        id: 1,
        slug: "relaxing-meditation",
        title: "Relaxing Meditation",
        modality: "meditation",
        category: "Relaxation",
        duration: "2.5 min",
        image: "https://example.com/relaxing.png",
        audio: "https://example.com/relaxing.mp3",
        description: "A gentle practice to release tension and find inner calm.",
        longDescription:
          "This practice uses a Sattva-forward approach to settle mental noise, soften muscular holding, and anchor awareness in the present moment.",
        guidance:
          "Focus on a slow inhale and a longer exhale. Let the body feel supported.",
        rating: 4.9,
        reviews: 128,
        tags: ["Calm", "Vata Balancing", "Vedic Wisdom", "Visualization"],
        level: "Beginner",
        dosha: "Vata",
        instructor: {
          name: "Dr. Amara Sethi",
          role: "Lead Research & Vedic Scholar",
          bio: "Dr. Sethi is a lead research scholar specializing in Vedic psychology and contemplative neuroscience.",
          image: "https://example.com/instructor.png",
        },
        benefits: [
          { id: 1, title: "Cognitive Clarity", text: "Settles mental noise." },
        ],
        scientificSynthesis: {
          title: "Structural Resilience & Network Stability",
          text: "Mindfulness practice is associated with stronger attentional control.",
          source:
            "Massachusetts General Hospital. (2025). Mindfulness meditation and network neuroscience review.",
        },
      },
      0
    );

    const params = buildMeditationRouteParams(template);
    const hydrated = hydrateMeditationTemplate(params, template);

    expect(template.id).toBe("1");
    expect(template.slug).toBe("relaxing-meditation");
    expect(template.durationLabel).toBe("2.5 min");
    expect(template.source).toBe("https://example.com/relaxing.mp3");
    expect(template.longDescription).toContain("Sattva-forward");
    expect(template.guidance).toContain("slow inhale");
    expect(template.instructor?.name).toBe("Dr. Amara Sethi");
    expect(template.benefits).toHaveLength(1);
    expect(template.scientificSynthesis?.title).toBe(
      "Structural Resilience & Network Stability"
    );
    expect(template.tag).toBe("calm");
    expect(template.tags).toContain("calm");
    expect(template.tags).toContain("vata-balancing");
    expect(template.level).toBe("Beginner");
    expect(template.dosha).toBe("Vata");
    expect(template.rating).toBe(4.9);
    expect(template.reviews).toBe(128);
    expect(params.meditationId).toBe("1");
    expect(params.meditationImage).toBe("https://example.com/relaxing.png");
    expect(params.meditationSource).toBe("https://example.com/relaxing.mp3");
    expect(params.meditationGuidance).toContain("slow inhale");
    expect(hydrated.title).toBe("Relaxing Meditation");
    expect(hydrated.durationLabel).toBe("2.5 min");
    expect(hydrated.guidance).toContain("slow inhale");
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
