import React from "react";
import { Pressable, Text, TextInput } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import ReflectionEntryScreen from "../ReflectionEntryScreen";
import {
  completeReflectionSession,
  getReflectionSession,
  saveReflectionSessionStep,
} from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockToastShow = jest.fn();
const mockToast = {
  show: mockToastShow,
};

const mockNavigation = {
  setOptions: jest.fn(),
};

let mockParams: Record<string, string> = {
  journalId: "anger-template",
  journalSessionId: "19",
  journalTitle: "When you feel Angry",
  journalDescription: "Pause before the heat takes over.",
  journalTags: "anger",
  journalQuestions: JSON.stringify([
    {
      id: 1,
      step_number: 1,
      text: "What boundary was crossed?",
      type: "text",
    },
    {
      id: 2,
      step_number: 2,
      text: "What do you need to say now?",
      type: "text",
    },
    {
      id: 3,
      step_number: 3,
      text: "What can cool the heat?",
      type: "text",
    },
  ]),
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
    replace: (...args: any[]) => mockReplace(...args),
  },
  useNavigation: () => mockNavigation,
  useLocalSearchParams: () => mockParams,
}));

jest.mock("../../services/selfCareService", () => ({
  getReflectionSession: jest.fn(),
  saveReflectionSessionStep: jest.fn(),
  completeReflectionSession: jest.fn(),
}));

jest.mock("../../../../components/ui/toast/useNimbusToast", () => ({
  useNimbusToast: () => mockToast,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native-paper", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    ProgressBar: (props: any) => React.createElement(View, props),
  };
});

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

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <ReflectionEntryScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("ReflectionEntryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      journalId: "anger-template",
      journalSessionId: "19",
      journalTitle: "When you feel Angry",
      journalDescription: "Pause before the heat takes over.",
      journalTags: "anger",
      journalQuestions: JSON.stringify([
        {
          id: 1,
          step_number: 1,
          text: "What boundary was crossed?",
          type: "text",
        },
        {
          id: 2,
          step_number: 2,
          text: "What do you need to say now?",
          type: "text",
        },
        {
          id: 3,
          step_number: 3,
          text: "What can cool the heat?",
          type: "text",
        },
      ]),
    };

    (saveReflectionSessionStep as jest.Mock).mockResolvedValue({
      success: true,
      message: "Saved",
      data: {
        id: 19,
        status: "in_progress",
        current_step: 3,
        total_steps: 3,
        template_slug: "when-you-feel-angry",
        template_title: "When you feel Angry",
        category: "anger",
        trigger_source: "manual",
        trigger_metadata: {},
        summary_status: "not_requested",
        summary_text: "",
        intensity_score: null,
        safety_flags: [],
        started_at: "2026-04-30T13:07:52.382474Z",
        last_saved_at: "2026-04-30T13:08:01.458634Z",
        completed_at: null,
        summary_generated_at: null,
        responses: [
          {
            step_number: 1,
            question_text_snapshot: "What boundary was crossed?",
            answer: "A meeting crossed the line.",
            saved_at: "2026-04-30T13:07:53.000000Z",
          },
          {
            step_number: 2,
            question_text_snapshot: "What do you need to say now?",
            answer: "I need to speak clearly.",
            saved_at: "2026-04-30T13:08:01.000000Z",
          },
        ],
        current_question: {
          id: 3,
          step_number: 3,
          text: "What can cool the heat?",
          type: "text",
        },
      },
    });

    (completeReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      message: "Completed",
      data: {
        id: 19,
        total_steps: 3,
      },
    });
  });

  it("shows earlier answered steps as read-only before resuming the current step", async () => {
    (getReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      message: "Loaded",
      data: {
        id: 19,
        status: "in_progress",
        current_step: 3,
        total_steps: 3,
        template_slug: "when-you-feel-angry",
        template_title: "When you feel Angry",
        category: "anger",
        trigger_source: "manual",
        trigger_metadata: {},
        summary_status: "not_requested",
        summary_text: "",
        intensity_score: null,
        safety_flags: [],
        started_at: "2026-04-30T13:07:52.382474Z",
        last_saved_at: "2026-04-30T13:08:01.458634Z",
        completed_at: null,
        summary_generated_at: null,
        responses: [
          {
            step_number: 1,
            question_text_snapshot: "What boundary was crossed?",
            answer: "A meeting crossed the line.",
            saved_at: "2026-04-30T13:07:53.000000Z",
          },
          {
            step_number: 2,
            question_text_snapshot: "What do you need to say now?",
            answer: "I need to speak clearly.",
            saved_at: "2026-04-30T13:08:01.000000Z",
          },
        ],
        current_question: {
          id: 3,
          step_number: 3,
          text: "What can cool the heat?",
          type: "text",
        },
      },
    });

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(getReflectionSession).toHaveBeenCalledWith(19);
    expect(hasText(tree, "What boundary was crossed?")).toBe(true);
    expect(
      hasText(
        tree,
        "Saved answer from this session. Continue to reach the next editable step."
      )
    ).toBe(true);

    const input = tree.root.findByType(TextInput);
    expect(input.props.value).toBe("A meeting crossed the line.");
    expect(input.props.editable).toBe(false);

    const firstNextButton = tree.root.findByProps({
      accessibilityLabel: "Next Question",
    });

    expect(firstNextButton.props.disabled).toBe(false);

    await act(async () => {
      await firstNextButton.props.onPress();
    });

    expect(hasText(tree, "What do you need to say now?")).toBe(true);

    const secondInput = tree.root.findByType(TextInput);
    expect(secondInput.props.value).toBe("I need to speak clearly.");
    expect(secondInput.props.editable).toBe(false);

    const secondNextButton = tree.root.findByProps({
      accessibilityLabel: "Next Question",
    });

    await act(async () => {
      await secondNextButton.props.onPress();
    });

    expect(hasText(tree, "What can cool the heat?")).toBe(true);

    const editableInput = tree.root.findByType(TextInput);
    expect(editableInput.props.value).toBe("");
    expect(editableInput.props.editable).toBe(true);

    act(() => {
      editableInput.props.onChangeText("Breathing before I answer.");
    });

    const actionButton = tree.root.findByProps({
      accessibilityLabel: "Complete Reflection",
    });

    await act(async () => {
      await actionButton.props.onPress();
    });

    expect(saveReflectionSessionStep).toHaveBeenCalledWith(19, 3, {
      answer: "Breathing before I answer.",
    });
  });

  it("starts from the first question when the resumed session is still at step one", async () => {
    (getReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      message: "Loaded",
      data: {
        id: 19,
        status: "draft",
        current_step: 1,
        total_steps: 3,
        template_slug: "when-you-feel-angry",
        template_title: "When you feel Angry",
        category: "anger",
        trigger_source: "manual",
        trigger_metadata: {},
        summary_status: "not_requested",
        summary_text: "",
        intensity_score: null,
        safety_flags: [],
        started_at: "2026-04-30T13:07:52.382474Z",
        last_saved_at: "2026-04-30T13:08:01.458634Z",
        completed_at: null,
        summary_generated_at: null,
        responses: [],
        current_question: null,
      },
    });

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(hasText(tree, "What boundary was crossed?")).toBe(true);
    expect(hasText(tree, "QUESTION 01")).toBe(true);

    const input = tree.root.findByType(TextInput);
    expect(input.props.value).toBe("");
  });
});
