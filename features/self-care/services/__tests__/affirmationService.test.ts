import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";
import { getAffirmations } from "../affirmationService";

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("affirmationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps the affirmations payload into the app deck shape", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Affirmations retrieved successfully.",
        data: [
          {
            id: "quiet-power-ii",
            title: "Quiet Power ii",
            tone: "Calmness",
            tags: ["calm", "focus"],
            quotes: {
              quote_title: "Quiet Power ii",
              tags: ["calm", "focus"],
              quote_content: [
                "Steady energy is stronger than rushed effort.",
                "Calm repetition builds real confidence.",
              ],
            },
            quote_detail:
              "A cleaner rhythm for focus, study, and follow-through.",
          },
          {
            id: "quiet-power",
            title: "Quiet Power",
            tone: "Wealth",
            tags: ["wealth", "prosperity"],
            quotes: {
              quote_title: "Quiet Power",
              tags: ["wealth", "prosperity"],
              quote_content: [
                "Steady energy is stronger than rushed effort.",
              ],
            },
            quote_detail:
              "A cleaner rhythm for focus, study, and follow-through.",
          },
        ],
        pagination: {
          count: 2,
          next: null,
          previous: null,
          page: 1,
          page_size: 100,
          total_pages: 1,
          results_count: 2,
        },
      },
    });

    const deck = await getAffirmations();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      API_ENDPOINTS.getAffirmations
    );
    expect(deck.cards).toEqual([
      {
        id: "quiet-power-ii",
        title: "Quiet Power ii",
        tone: "Calmness",
        toneCategory: "calm",
        quote: "Steady energy is stronger than rushed effort.",
        storyQuote:
          "Steady energy is stronger than rushed effort.\nCalm repetition builds real confidence.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        tags: ["calm", "focus"],
        statements: [
          "Steady energy is stronger than rushed effort.",
          "Calm repetition builds real confidence.",
        ],
        paletteKey: "calm",
      },
      {
        id: "quiet-power",
        title: "Quiet Power",
        tone: "Wealth",
        toneCategory: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        storyQuote: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        tags: ["wealth", "prosperity"],
        statements: ["Steady energy is stronger than rushed effort."],
        paletteKey: "confidence",
      },
    ]);
    expect(deck.recommendations[0]).toMatchObject({
      id: "quiet-power-ii",
      tone: "Calmness",
      toneCategory: "calm",
      title: "Quiet Power ii",
      affirmation:
        "Steady energy is stronger than rushed effort.\nCalm repetition builds real confidence.",
      tag: "Calmness",
    });
  });

  it("returns an empty deck when the API succeeds with no affirmations", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Affirmations retrieved successfully.",
        data: [],
        pagination: {
          count: 0,
          next: null,
          previous: null,
          page: 1,
          page_size: 100,
          total_pages: 0,
          results_count: 0,
        },
      },
    });

    const deck = await getAffirmations();

    expect(deck).toEqual({
      cards: [],
      recommendations: [],
    });
  });

  it("throws when the API request fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockedAxios.get.mockRejectedValueOnce(new Error("network down"));

    await expect(getAffirmations()).rejects.toThrow("network down");
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
