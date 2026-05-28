import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

import {
  getWellnessContentDetail,
  getWellnessContentList,
} from "../selfCareService";

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("selfCareService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches meditation wellness content with the modality query", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness content retrieved successfully.",
        data: [
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
            tags: ["Calm", "Vata Balancing"],
            level: "Beginner",
            dosha: "Vata",
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
      },
    });

    const result = await getWellnessContentList({ modality: "meditation" });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getWellnessContent,
      { params: { modality: "meditation" } }
    );
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("relaxing-meditation");
  });

  it("fetches a single wellness content detail by id", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness content retrieved successfully.",
        data: {
          id: 1,
          title: "Relaxing Meditation",
          duration: "2.5 min",
          category: "Relaxation",
          image: "https://example.com/relaxing.png",
          audio: "https://example.com/relaxing.mp3",
          description: "A gentle practice to release tension and find inner calm.",
          longDescription:
            "This practice uses a Sattva-forward approach to settle mental noise.",
          guidance:
            "Focus on a slow inhale and a longer exhale. Let the body feel supported.",
          date: "Oct 24, 2026",
          dosha: "Vata",
          level: "Beginner",
          rating: 4.9,
          reviews: 128,
          tags: ["Calm", "Vata Balancing"],
          instructor: {
            name: "Dr. Amara Sethi",
            role: "Lead Research & Vedic Scholar",
            bio: "Dr. Sethi is a lead research scholar specializing in Vedic psychology and contemplative neuroscience.",
            image: "https://example.com/instructor.png",
          },
          benefits: [
            {
              id: 1,
              title: "Cognitive Clarity",
              text: "Settles mental noise so attention feels less fragmented.",
            },
          ],
          scientificSynthesis: {
            title: "Structural Resilience & Network Stability",
            text: "Mindfulness practice is associated with stronger attentional control.",
            source:
              "Massachusetts General Hospital. (2025). Mindfulness meditation and network neuroscience review.",
          },
        },
      },
    });

    const result = await getWellnessContentDetail(1);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getWellnessContentDetail(1)
    );
    expect(result.success).toBe(true);
    expect(result.data.audio).toBe("https://example.com/relaxing.mp3");
    expect(result.data.instructor.name).toBe("Dr. Amara Sethi");
  });
});
