import axios from "axios";

import { API_ENDPOINTS } from "@/config/apiConfig";

import {
  getAffirmations,
  getMockAffirmationDeck,
} from "../affirmationService";

jest.mock("axios", () => ({
  get: jest.fn(),
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
            tone: "confidence",
            quotes: {
              quote_title: "Quiet Power ii",
              tags: ["focus", "study"],
              quote_content: [
                "Steady energy is stronger than rushed effort.",
              ],
            },
            quote_detail:
              "A cleaner rhythm for focus, study, and follow-through.",
          },
          {
            id: "quiet-power",
            tone: "confidence",
            quotes: {
              quote_title: "Quiet Power",
              tags: ["focus", "study"],
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
    expect(deck.source).toBe("api");
    expect(deck.message).toBe("Affirmations retrieved successfully.");
    expect(deck.cards).toEqual([
      {
        id: "quiet-power-ii",
        tone: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        paletteKey: "steady-breath",
      },
      {
        id: "quiet-power",
        tone: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        paletteKey: "clear-steps",
      },
    ]);
    expect(deck.recommendations[0]).toMatchObject({
      id: "quiet-power-ii",
      tone: "confidence",
      title: "Quiet Power ii",
      affirmation: "Steady energy is stronger than rushed effort.",
      tag: "Focus",
    });
  });

  it("falls back to the mock deck when the API request fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockedAxios.get.mockRejectedValueOnce(new Error("network down"));

    const deck = await getAffirmations();

    expect(deck).toEqual(getMockAffirmationDeck());
    expect(deck.source).toBe("mock");
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
