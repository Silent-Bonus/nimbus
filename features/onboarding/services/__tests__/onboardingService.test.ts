import axios from "axios";

import {
  buildDoshaResponseItem,
  buildDoshaSubmissionPayload,
  fetchPersonaQuestions,
  submitPersonaAnswers,
} from "../onboardingService";
import { API_ENDPOINTS } from "@/config/apiConfig";

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("onboardingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normalizes nested backend questions into the UI shape", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Questions loaded",
        data: {
          questions: [
            {
              id: 1,
              category: "Body Structure & Physical Traits",
              question: "Your body frame is usually:",
              options: [
                {
                  id: "a",
                  label: "Thin, light, hard to gain weight",
                  score_weight: { vata: 1, pitta: 0, kapha: 0 },
                },
                {
                  id: "b",
                  label: "Medium, athletic, well-proportioned",
                },
                {
                  id: "c",
                  label: "Broad, sturdy, gains weight easily",
                },
              ],
            },
          ],
        },
      },
    });

    const result = await fetchPersonaQuestions();

    expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.personaQuestion);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Questions loaded");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.data[0].category).toBe("Body Structure & Physical Traits");
    expect(result.data[0].question).toBe("Your body frame is usually:");
    expect(result.data[0].options.map((option) => option.id)).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(result.data[0].options[0].score_weight).toEqual({
      vata: 1,
      pitta: 0,
      kapha: 0,
    });
    expect(result.data[0].options[1].score_weight).toBeUndefined();
  });

  it("builds the default dosha score weight when the backend does not provide one", () => {
    const response = buildDoshaResponseItem(
      {
        id: 4,
        category: "Body Structure & Physical Traits",
        question: "You are most uncomfortable in:",
        options: [],
      },
      {
        id: "b",
        label: "Hot weather or strong sun",
      }
    );

    expect(response).toEqual({
      question_id: 4,
      selected_option: "B",
      score_weight: {
        vata: 0,
        pitta: 1,
        kapha: 0,
      },
    });
  });

  it("sorts responses before building the submission payload and posts it raw", async () => {
    const payload = buildDoshaSubmissionPayload([
      {
        question_id: 17,
        selected_option: "C",
        score_weight: { vata: 0, pitta: 0, kapha: 1 },
      },
      {
        question_id: 1,
        selected_option: "B",
        score_weight: { vata: 0, pitta: 1, kapha: 0 },
      },
    ]);

    expect(payload.dosha_responses.map((item) => item.question_id)).toEqual([
      1,
      17,
    ]);

    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, message: "Saved", data: { ok: true } },
    });

    const result = await submitPersonaAnswers(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      API_ENDPOINTS.submitPersonaAnswers,
      payload
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe("Saved");
  });
});
