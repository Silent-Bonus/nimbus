import {
  buildMeditationFilterOptions,
  buildMeditationRouteParams,
  mapMeditationDetailItemTemplate,
  mapMeditationListItemTemplate,
} from "../meditationLibrary";

const meditationTemplates = [
  mapMeditationListItemTemplate(
    {
      id: 1,
      title: "Sleep Drift",
      modality: "meditation",
      description: "Let the body grow heavier while the breath becomes quieter.",
      category: "sleep",
      duration: 8,
      image: "https://example.com/sleep.png",
      rating: 0,
      reviews: 0,
      tags: ["Sleep"],
      level: "All Levels",
      dosha: "All",
      source: "https://example.com/sleep.mp3",
    },
    0
  ),
  mapMeditationListItemTemplate(
    {
      id: 2,
      title: "Focus Lantern",
      modality: "meditation",
      description:
        "Return to one bright point at a time and let the edges soften.",
      category: "focus",
      duration: 6,
      image: "https://example.com/focus.png",
      rating: 0,
      reviews: 0,
      tags: ["Focus"],
      level: "All Levels",
      dosha: "All",
      source: "https://example.com/focus.mp3",
    },
    1
  ),
];

describe("meditationLibrary", () => {
  it("maps raw meditation items into premium template data", () => {
    const template = mapMeditationListItemTemplate(
      {
        id: 19,
        slug: "moon-breath",
        title: "Moon Breath",
        modality: "meditation",
        description: "Slow the inhale and exhale until the room softens.",
        category: "breathwork",
        duration: 6,
        image: "https://example.com/moon-breath.png",
        rating: 0,
        reviews: 0,
        tags: ["Breath"],
        level: "All Levels",
        dosha: "All",
        source: "https://example.com/moon-breath.mp3",
      },
      0
    );

    expect(template.id).toBe("19");
    expect(template.slug).toBe("moon-breath");
    expect(template.title).toBe("Moon Breath");
    expect(template.durationLabel).toBe("6 min");
    expect(template.rating).toBe(4.2);
    expect(template.tags).toContain("Breath");
    expect(template.source).toBe("https://example.com/moon-breath.mp3");
  });

  it("adds a stronger mock description and normalizes category when the API omits description", () => {
    const template = mapMeditationListItemTemplate(
      {
        id: 1,
        slug: "deep-sleep-tonight",
        title: "Deep Sleep Tonight",
        modality: "meditation",
        category: "Relaxtion",
        duration: "1.7 min",
        image:
          "https://unsplash.com/photos/a-woman-sitting-on-the-floor-in-front-of-a-rock-0fvOfPOfV1g",
        rating: 0,
        reviews: 0,
        tags: [],
        level: "Beginner",
        dosha: "All",
      },
      0
    );

    expect(template.description).toBe(
      "A quiet sleep meditation to help your body settle and your mind soften before rest."
    );
    expect(template.category).toBe("Relaxation");
    expect(template.durationLabel).toBe("1.7 min");
    expect(template.rating).toBe(4.2);
    expect(template.image).not.toEqual({
      uri:
        "https://unsplash.com/photos/a-woman-sitting-on-the-floor-in-front-of-a-rock-0fvOfPOfV1g",
    });
  });

  it("normalizes detailed wellness content into meditation templates and route params", () => {
    const template = mapMeditationDetailItemTemplate(
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
      }
    );

    const params = buildMeditationRouteParams(template);

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
    expect(template.tags).toContain("Calm");
    expect(template.tags).toContain("Vata Balancing");
    expect(template.level).toBe("Beginner");
    expect(template.dosha).toBe("Vata");
    expect(template.rating).toBe(4.9);
    expect(template.reviews).toBe(128);
    expect(params.meditationId).toBe("1");
    expect(params.meditationImage).toBe("https://example.com/relaxing.png");
    expect(params.meditationSource).toBe("https://example.com/relaxing.mp3");
    expect(params.meditationGuidance).toContain("slow inhale");
  });

  it("builds unique category filters from template categories", () => {
    const options = buildMeditationFilterOptions(meditationTemplates);

    expect(options[0]).toEqual({ label: "All Modes", value: "all" });
    expect(options.some((option) => option.label === "Beginner")).toBe(false);
    expect(options.some((option) => option.label === "Focus")).toBe(true);
    expect(options.some((option) => option.value === "sleep")).toBe(true);
  });
});
