import {
  resolveSoundscapeTracks,
  toSoundscapeTrack,
} from "../soundscapeLibrary";

describe("soundscapeLibrary", () => {
  it("normalizes wellness content list items into soundscape tracks", () => {
    const result = resolveSoundscapeTracks({
      success: true,
      message: "Wellness content retrieved successfully.",
      data: [
        {
          id: 7,
          slug: "restorative-tissue-flow",
          title: "Restorative Tissue Flow",
          modality: "soundscape",
          category: "heal",
          duration: "0.0 min",
          image: null,
          metadata: {},
          rating: 0,
          reviews: 0,
          tags: ["kapha", "tridoshic"],
          level: "Beginner",
          dosha: "Kapha",
        },
      ],
      pagination: {
        count: 1,
        next: null,
        previous: null,
        page: 1,
        page_size: 100,
        total_pages: 1,
        results_count: 1,
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "7",
      title: "Restorative Tissue Flow",
      category: "Heal",
      duration: "3 min",
      durationLabel: "3 min",
      isLocked: false,
    });
    expect(result[0].description.toLowerCase()).toContain("heal soundscape");
    expect(result[0].tags).toEqual(["Kapha", "Tridoshic"]);
    expect(result[0].filterTags).toEqual(
      expect.arrayContaining(["Heal"])
    );
    expect(result[0].rating).toBe(4);
    expect(result[0].moodLabel).toBe("Test mood");
    expect(result[0].image).toBeTruthy();
    expect(result[0].source).toBeTruthy();
  });

  it("prefers numeric ids over slug and falls back to generated descriptions", () => {
    const track = toSoundscapeTrack(
      {
        id: 11,
        slug: "focus-current",
        title: "Focus Current",
        modality: "soundscape",
        category: "focus",
        duration: 8,
        image: null,
        rating: 0,
        reviews: 0,
        tags: [],
        level: "All Levels",
        dosha: "All",
      },
      0
    );

    expect(track.id).toBe("11");
    expect(track.durationLabel).toBe("8 min");
    expect(track.description.toLowerCase()).toContain("focus soundscape");
    expect(track.tags).toEqual([]);
    expect(track.filterTags).toEqual(expect.arrayContaining(["Focus"]));
    expect(track.rating).toBe(4);
    expect(track.moodLabel).toBe("Test mood");
  });
});
