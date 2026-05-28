import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

import { getWellnessContentList } from "../selfCareService";

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
});
