import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

import {
  completeWellnessSession,
  createWellnessSession,
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

  it("creates a wellness session for the meditation detail start flow", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session created successfully.",
        data: {
          session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
          id: 2,
          activity_type: "soundscape",
          activity_type_display: "Soundscape",
          content_type: "wellness_content.wellnesscontent",
          object_id: 6,
          content_label: "174 Hz | The Foundation of Healing",
          source: "manual",
          source_display: "Manual",
          status: "active",
          status_display: "Active",
          started_at: "2026-05-05T12:14:25.441160Z",
          paused_at: null,
          resumed_at: null,
          completed_at: null,
          duration_seconds: 0,
          metadata: {
            entry_surface: "content_detail",
            test_mode: true,
          },
          has_feedback: false,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:14:25.441474Z",
        },
      },
    });

    const payload = {
      activity_type: "soundscape",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: 6,
      source: "manual",
      metadata: {
        entry_surface: "content_detail",
        test_mode: true,
      },
    };

    const result = await createWellnessSession(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.createWellnessSession,
      payload
    );
    expect(result.success).toBe(true);
    expect(result.data.session_ref).toBe(
      "c90e8cea-42af-47d2-a4b5-62e8e7bb027c"
    );
  });

  it("completes a wellness session by session ref", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session completed successfully.",
        data: {
          session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
          id: 2,
          activity_type: "soundscape",
          activity_type_display: "Soundscape",
          content_type: "wellness_content.wellnesscontent",
          object_id: 6,
          content_label: "174 Hz | The Foundation of Healing",
          source: "manual",
          source_display: "Manual",
          status: "completed",
          status_display: "Completed",
          started_at: "2026-05-05T12:14:25.441160Z",
          paused_at: null,
          resumed_at: null,
          completed_at: "2026-05-05T12:23:22.757043Z",
          duration_seconds: 205,
          metadata: {
            test_mode: true,
            entry_surface: "content_detail",
          },
          has_feedback: false,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:23:22.757187Z",
        },
      },
    });

    const result = await completeWellnessSession(
      "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
      {
        duration_seconds: 205,
      }
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.completeWellnessSession(
        "c90e8cea-42af-47d2-a4b5-62e8e7bb027c"
      ),
      {
        duration_seconds: 205,
      }
    );
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("completed");
  });
});
