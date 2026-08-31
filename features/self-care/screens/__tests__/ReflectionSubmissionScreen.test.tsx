import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import ReflectionSubmissionScreen from "../ReflectionSubmissionScreen";
import { getReflectionSession } from "../../services/selfCareService";

const mockReplace = jest.fn();
const mockParams: Record<string, string> = {};
const mockNavigation = {
  setOptions: jest.fn(),
};

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
  },
  useNavigation: () => mockNavigation,
  useLocalSearchParams: () => mockParams,
}));

jest.mock("../../services/selfCareService", () => ({
  getReflectionSession: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../../utils/date-time", () => ({
  toFriendlyDate: (value: string) =>
    value.includes("2026-04-30T13:07:03") ? "Today" : "Yesterday",
  formatReminderTime: (value: string) =>
    value.includes("2026-04-30T13:07:03") ? "01:07 PM" : "01:06 PM",
}));

const theme = getTheme("sva");
const themeValue = {
  theme: "sva",
  toggleTheme: jest.fn(),
  useSystemTheme: jest.fn(),
  newTheme: theme.colors,
  svaColors: theme.svaColors,
  spacing: theme.spacing,
  typography: theme.typography,
  svaTypography: theme.svaTypography,
  svaSpacing: theme.svaSpacing,
  svaComponents: theme.svaComponents,
  tokens: theme.tokens,
  activeTheme: theme,
};

const getTextContent = (node: any): string =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : String(node.props.children ?? "");

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root.findAllByType(Text).some((node) => getTextContent(node).includes(value));

function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <ReflectionSubmissionScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("ReflectionSubmissionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);

    Object.assign(mockParams, {
      journalSessionId: "2",
    });
  });

  it("renders the completed reflection review with mapped prompts and answers", async () => {
    (getReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2,
        status: "completed",
        current_step: 5,
        total_steps: 5,
        template_slug: "gratitude-close",
        template_title: "Gratitude Close",
        category: "gratitude",
        trigger_source: "manual",
        trigger_metadata: {},
        summary_status: "completed",
        summary_text:
          "You completed the Gratitude Close reflection. You started by noticing: A quiet cup of tea before sunrise. You closed with: Softness.",
        intensity_score: 1,
        safety_flags: [],
        started_at: "2026-04-30T13:07:03.536886Z",
        last_saved_at: "2026-04-30T13:07:03.536889Z",
        completed_at: "2026-04-30T13:07:03.536806Z",
        summary_generated_at: "2026-04-30T13:07:03.546556Z",
        responses: [
          {
            step_number: 1,
            question_text_snapshot:
              "What is one 'micro-blessing' you noticed today?",
            answer: "A quiet cup of tea before sunrise.",
            saved_at: "2026-04-30T13:07:03.538463Z",
          },
          {
            step_number: 5,
            question_text_snapshot:
              "What is your one-word mantra for this feeling?",
            answer: "Softness.",
            saved_at: "2026-04-30T13:07:03.540098Z",
          },
        ],
        current_question: null,
      },
    });

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderScreen();
    });

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(hasText(tree, "Reflection review")).toBe(true);
    expect(hasText(tree, "Gratitude Close")).toBe(true);
    expect(hasText(tree, "REFLECTION SUMMARY")).toBe(true);
    expect(
      hasText(
        tree,
        "You completed the Gratitude Close reflection. You started by noticing: A quiet cup of tea before sunrise. You closed with: Softness."
      )
    ).toBe(true);
    expect(hasText(tree, "Your Reflection Thread")).toBe(true);
    expect(
      hasText(tree, "What is one 'micro-blessing' you noticed today?")
    ).toBe(true);
    expect(hasText(tree, "A quiet cup of tea before sunrise.")).toBe(true);
    expect(
      hasText(tree, "What is your one-word mantra for this feeling?")
    ).toBe(true);
    expect(hasText(tree, "Softness.")).toBe(true);
  });

  it("shows the placeholder when the summary is not ready yet", async () => {
    (getReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2,
        status: "completed",
        current_step: 5,
        total_steps: 5,
        template_slug: "gratitude-close",
        template_title: "Gratitude Close",
        category: "gratitude",
        trigger_source: "manual",
        trigger_metadata: {},
        summary_status: "failed",
        summary_text: "",
        intensity_score: null,
        safety_flags: [],
        started_at: "2026-04-30T13:07:03.536886Z",
        last_saved_at: "2026-04-30T13:07:03.536889Z",
        completed_at: "2026-04-30T13:07:03.536806Z",
        summary_generated_at: null,
        responses: [],
        current_question: null,
      },
    });

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderScreen();
    });

    expect(hasText(tree, "Summary not ready yet")).toBe(true);
    expect(
      hasText(
        tree,
        "Check back later from the archive to see the completed reflection summary."
      )
    ).toBe(true);

    act(() => {
      tree.unmount();
    });
  });
});
