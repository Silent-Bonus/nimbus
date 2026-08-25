import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

import {
  getWellnessContentDetail,
  getWellnessContentList,
} from "../selfCareService";
import {
  completeWellnessSession,
  createMoodLog,
  createWellnessSession,
  getMoodLogStats,
  getWellnessSessionByRef,
  getWellnessSessionList,
  getWellnessSummary,
  pauseWellnessSession,
  resumeWellnessSession,
  submitWellnessSessionFeedback,
} from "../wellnessSessionService";
import type {
  WellnessSessionFeedbackRequest,
  WellnessSessionRequest,
} from "../../types/wellnessSessionTypes";

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

  it("fetches soundscape wellness content with the soundscape modality", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness content retrieved successfully.",
        data: [
          {
            id: 2,
            slug: "rain-over-cedar",
            title: "Rain Over Cedar",
            modality: "soundscape",
            category: "Nature",
            duration: "10 min",
            image: "https://example.com/rain.png",
            source: "https://example.com/rain.mp3",
            rating: 4.8,
            reviews: 72,
            tags: ["Nature", "Sleep"],
            level: "All Levels",
            dosha: "Vata",
          },
        ],
      },
    });

    const result = await getWellnessContentList({ modality: "soundscape" });

    expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.getWellnessContent, {
      params: { modality: "soundscape" },
    });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("rain-over-cedar");
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
    expect(result.data.instructor?.name).toBe("Dr. Amara Sethi");
  });

  it("creates a wellness session for the meditation detail start flow", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session created successfully.",
        data: {
        session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
        id: 2,
        activity_type: "meditation",
        activity_type_display: "Meditation",
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

    const payload: WellnessSessionRequest = {
      activity_type: "meditation",
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

  it("creates a manual wellness session with the session tracking payload", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session created successfully.",
        data: {
          session_ref: "manual-session-ref",
          id: 4,
          activity_type: "breathwork",
          activity_type_display: "Breathwork",
          content_type: "wellness_content.wellnesscontent",
          object_id: 5,
          content_label: "Release Path",
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

    const payload: WellnessSessionRequest = {
      activity_type: "breathwork",
      content_type: "wellness_content.wellnesscontent",
      content_object_id: 5,
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
    expect(result.data.session_ref).toBe("manual-session-ref");
  });

  it("completes a wellness session by session ref", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session completed successfully.",
        data: {
        session_ref: "c90e8cea-42af-47d2-a4b5-62e8e7bb027c",
        id: 2,
        activity_type: "meditation",
        activity_type_display: "Meditation",
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

  it("fetches the wellness session list", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness sessions retrieved successfully.",
        data: [
          {
            session_ref: "session-1",
            id: 1,
            activity_type: "breathwork",
            activity_type_display: "Breathwork",
            content_type: null,
            object_id: null,
            content_label: null,
            source: "manual",
            source_display: "Manual",
            status: "active",
            status_display: "Active",
            started_at: "2026-05-05T12:14:25.441160Z",
            paused_at: null,
            resumed_at: null,
            completed_at: null,
            duration_seconds: 0,
            metadata: {},
            has_feedback: false,
            created_at: "2026-05-05T12:14:25.441442Z",
            updated_at: "2026-05-05T12:14:25.441474Z",
          },
        ],
        pagination: {
          count: 1,
          next: null,
          previous: null,
          page: 1,
          page_size: 20,
          total_pages: 1,
          results_count: 1,
        },
      },
    });

    const result = await getWellnessSessionList();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getWellnessSessionList
    );
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].session_ref).toBe("session-1");
  });

  it("fetches a wellness session by session ref", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session retrieved successfully.",
        data: {
          session_ref: "session-2",
          id: 2,
          activity_type: "meditation",
          activity_type_display: "Meditation",
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
          metadata: {},
          has_feedback: false,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:14:25.441474Z",
        },
      },
    });

    const result = await getWellnessSessionByRef("session-2");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getWellnessSessionByRef("session-2")
    );
    expect(result.success).toBe(true);
    expect(result.data.session_ref).toBe("session-2");
  });

  it("pauses a wellness session", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session paused successfully.",
        data: {
          session_ref: "session-3",
          id: 3,
          activity_type: "breathwork",
          activity_type_display: "Breathwork",
          content_type: null,
          object_id: null,
          content_label: null,
          source: "manual",
          source_display: "Manual",
          status: "paused",
          status_display: "Paused",
          started_at: "2026-05-05T12:14:25.441160Z",
          paused_at: "2026-05-05T12:20:00.000000Z",
          resumed_at: null,
          completed_at: null,
          duration_seconds: 0,
          metadata: {},
          has_feedback: false,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:20:00.000000Z",
        },
      },
    });

    const result = await pauseWellnessSession("session-3");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.pauseWellnessSession("session-3")
    );
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("paused");
  });

  it("resumes a wellness session", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session resumed successfully.",
        data: {
          session_ref: "session-3",
          id: 3,
          activity_type: "breathwork",
          activity_type_display: "Breathwork",
          content_type: null,
          object_id: null,
          content_label: null,
          source: "manual",
          source_display: "Manual",
          status: "active",
          status_display: "Active",
          started_at: "2026-05-05T12:14:25.441160Z",
          paused_at: "2026-05-05T12:20:00.000000Z",
          resumed_at: "2026-05-05T12:21:00.000000Z",
          completed_at: null,
          duration_seconds: 0,
          metadata: {},
          has_feedback: false,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:21:00.000000Z",
        },
      },
    });

    const result = await resumeWellnessSession("session-3");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.resumeWellnessSession("session-3")
    );
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("active");
  });

  it("submits wellness session feedback", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness session feedback submitted successfully.",
        data: {
          session_ref: "session-4",
          id: 4,
          activity_type: "meditation",
          activity_type_display: "Meditation",
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
          metadata: {},
          has_feedback: true,
          created_at: "2026-05-05T12:14:25.441442Z",
          updated_at: "2026-05-05T12:23:22.757187Z",
        },
      },
    });

    const payload: WellnessSessionFeedbackRequest = {
      mood_label_before: "stressed",
      mood_label_after: "calm",
      mood_score_before: 3,
      mood_score_after: 7,
      calmness_before: 2,
      calmness_after: 8,
      stress_before: 8,
      stress_after: 4,
      relaxment_before: 2,
      relaxment_after: 7,
      energy_before: 4,
      energy_after: 5,
      felt_better: true,
      notes: "Helped me settle down quickly.",
      source: "post_session",
    };

    const result = await submitWellnessSessionFeedback("session-4", payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.submitWellnessSessionFeedback("session-4"),
      payload
    );
    expect(result.success).toBe(true);
    expect(result.data.has_feedback).toBe(true);
  });

  it("creates a mood log", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Mood log created successfully.",
        data: {
          id: 1,
          mood_label: "calm",
          mood_score: 7,
          calmness_score: 7,
          stress_score: 3,
          relaxment_score: 6,
          energy_score: 5,
          notes: "Morning check-in.",
          source: "manual",
          created_at: "2026-05-05T12:30:00.000000Z",
          updated_at: "2026-05-05T12:30:00.000000Z",
        },
      },
    });

    const payload = {
      mood_label: "calm",
      mood_score: 7,
      calmness_score: 7,
      stress_score: 3,
      relaxment_score: 6,
      energy_score: 5,
      notes: "Morning check-in.",
      source: "manual",
    };

    const result = await createMoodLog(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.createMoodLog,
      payload
    );
    expect(result.success).toBe(true);
    expect(result.data.mood_label).toBe("calm");
  });

  it("fetches mood log stats", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Mood log stats retrieved successfully.",
        data: {
          total_logs: 5,
          average_mood_score: 6.2,
        },
      },
    });

    const result = await getMoodLogStats();

    expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.getMoodLogStats);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      total_logs: 5,
      average_mood_score: 6.2,
    });
  });

  it("fetches the wellness summary", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Wellness summary retrieved successfully.",
        data: {
          active_sessions: 2,
          completed_sessions: 7,
        },
      },
    });

    const result = await getWellnessSummary();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getWellnessSummary
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      active_sessions: 2,
      completed_sessions: 7,
    });
  });
});
