import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import ReflectionDetailScreen from "../ReflectionDetailScreen";
import {
  abandonReflectionSession,
  getReflectionDetail,
  getReflectionSessionList,
  startReflectionSession,
} from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

const mockNavigation = {
  setOptions: jest.fn(),
};

let mockParams: Record<string, string> = {
  journalSlug: "journal-1",
  journalTitle: "The Morning Light",
  journalDescription:
    "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
  journalTags: "gratitude,mindfulness",
  journalDateLabel: "OCT 24",
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
  abandonReflectionSession: jest.fn(),
  getReflectionDetail: jest.fn(),
  getReflectionSessionList: jest.fn(),
  startReflectionSession: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock("../../../../components/ui/theme-components/NimbusButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    NimbusButton: ({ label, onPress, ...props }: any) =>
      React.createElement(
        Pressable,
        { accessibilityLabel: label, onPress, ...props },
        React.createElement(Text, null, label)
      ),
  };
});

jest.mock("../../../../components/ui/modal/ActionModal", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return function ActionModal(props: any) {
    if (!props.visible) {
      return null;
    }

    return React.createElement(
      View,
      { accessibilityLabel: "reflection-existing-session-alert" },
      props.eyebrow ? React.createElement(Text, null, props.eyebrow) : null,
      React.createElement(Text, null, props.title),
      props.body ? React.createElement(Text, null, props.body) : null,
      props.secondaryAction
        ? React.createElement(
            Pressable,
            {
              accessibilityLabel: props.secondaryAction.label,
              onPress: () => props.secondaryAction.onPress?.(),
            },
            React.createElement(Text, null, props.secondaryAction.label)
          )
        : null,
      props.primaryAction
        ? React.createElement(
            Pressable,
            {
              accessibilityLabel: props.primaryAction.label,
              onPress: () => props.primaryAction.onPress?.(),
            },
            React.createElement(Text, null, props.primaryAction.label)
          )
        : null
    );
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
        <ReflectionDetailScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("ReflectionDetailScreen", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = {
      journalSlug: "journal-1",
      journalTitle: "The Morning Light",
      journalDescription:
        "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
      journalTags: "gratitude,mindfulness",
      journalDateLabel: "OCT 24",
    };

    (getReflectionDetail as jest.Mock).mockResolvedValue({
      data: {
        template_id: "journal-1",
        title: "The Morning Light",
        category: "gratitude",
        description:
          "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
        benefits: [
          "Clarify what is present before you move on.",
          "Capture the thought while it still feels honest.",
        ],
        icon: "sun-outline",
        estimated_minutes: 3,
        total_steps: 3,
        questions: [
          {
            id: 1,
            step_number: 1,
            text: "What is the morning asking you to notice?",
            type: "text",
          },
        ],
      },
    });

    (getReflectionSessionList as jest.Mock).mockResolvedValue({
      success: true,
      message: "Loaded sessions",
      data: [],
    });

    (startReflectionSession as jest.Mock).mockResolvedValue({
      data: {
        id: 81,
      },
    });

    (abandonReflectionSession as jest.Mock).mockResolvedValue({
      success: true,
      message: "Abandoned",
      data: null,
    });
  });

  it("renders the premium reflection detail layout", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Reflection Prelude")).toBe(true);
    expect(hasText(tree, "The Morning Light")).toBe(true);
    expect(
      hasText(
        tree,
        "Today I feel a deep sense of gratitude for the soft amber light filtering through the window."
      )
    ).toBe(true);
    expect(hasText(tree, "#GRATITUDE")).toBe(true);
    expect(hasText(tree, "WHY IT HELPS")).toBe(true);
    expect(hasText(tree, "Start Reflection")).toBe(true);
  });

  it("starts the guided reflection flow with the selected template params", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Reflection",
    });

    await act(async () => {
      await startButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
      params: {
        journalId: "journal-1",
        journalSessionId: "81",
        journalTitle: "The Morning Light",
        journalDescription:
          "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
        journalTags: "gratitude",
        journalDateLabel: "3 MIN",
        journalBenefits: JSON.stringify([
          "Clarify what is present before you move on.",
          "Capture the thought while it still feels honest.",
        ]),
        journalQuestions: JSON.stringify([
          {
            id: 1,
            step_number: 1,
            text: "What is the morning asking you to notice?",
            type: "text",
          },
        ]),
        journalEstimatedMinutes: "3",
        journalTotalSteps: "3",
        journalCategory: "gratitude",
      },
    });
  });

  it("continues an existing reflection session when a session id is provided", async () => {
    mockParams = {
      journalSlug: "journal-1",
      journalSessionId: "19",
    };

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(hasText(tree, "Continue Session")).toBe(true);

    const continueButton = tree.root.findByProps({
      accessibilityLabel: "Continue Session",
    });

    await act(async () => {
      await continueButton.props.onPress();
    });

    expect(startReflectionSession).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
      params: {
        journalId: "journal-1",
        journalSessionId: "19",
        journalTitle: "The Morning Light",
        journalDescription:
          "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
        journalTags: "gratitude",
        journalDateLabel: "3 MIN",
        journalBenefits: JSON.stringify([
          "Clarify what is present before you move on.",
          "Capture the thought while it still feels honest.",
        ]),
        journalQuestions: JSON.stringify([
          {
            id: 1,
            step_number: 1,
            text: "What is the morning asking you to notice?",
            type: "text",
          },
        ]),
        journalEstimatedMinutes: "3",
        journalTotalSteps: "3",
        journalCategory: "gratitude",
      },
    });
  });

  it("shows a session warning and continues the previous session for the same template", async () => {
    (getReflectionSessionList as jest.Mock).mockResolvedValue({
      success: true,
      message: "Loaded sessions",
      data: [
        {
          id: 44,
          status: "in_progress",
          current_step: 2,
          total_steps: 3,
          template_slug: "journal-1",
          template_title: "The Morning Light",
          category: "gratitude",
          trigger_source: "manual",
          trigger_metadata: {},
          summary_status: "not_requested",
          summary_text: "",
          intensity_score: null,
          safety_flags: [],
          started_at: "2026-04-30T13:07:03.536886Z",
          last_saved_at: "2026-04-30T13:07:03.536889Z",
          completed_at: null,
          summary_generated_at: null,
          responses: [],
          current_question: null,
        },
      ],
    });

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Reflection",
    });

    await act(async () => {
      await startButton.props.onPress();
    });

    expect(hasText(tree, "You already started this reflection")).toBe(true);

    const continueButton = tree.root.findByProps({
      accessibilityLabel: "Continue Previous Session",
    });

    await act(async () => {
      await continueButton.props.onPress();
    });

    expect(startReflectionSession).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
      params: {
        journalId: "journal-1",
        journalSessionId: "44",
        journalTitle: "The Morning Light",
        journalDescription:
          "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
        journalTags: "gratitude",
        journalDateLabel: "3 MIN",
        journalBenefits: JSON.stringify([
          "Clarify what is present before you move on.",
          "Capture the thought while it still feels honest.",
        ]),
        journalQuestions: JSON.stringify([
          {
            id: 1,
            step_number: 1,
            text: "What is the morning asking you to notice?",
            type: "text",
          },
        ]),
        journalEstimatedMinutes: "3",
        journalTotalSteps: "3",
        journalCategory: "gratitude",
      },
    });
  });

  it("shows a session warning and can still start a new session", async () => {
    (getReflectionSessionList as jest.Mock).mockResolvedValue({
      success: true,
      message: "Loaded sessions",
      data: [
        {
          id: 44,
          status: "in_progress",
          current_step: 2,
          total_steps: 3,
          template_slug: "journal-1",
          template_title: "The Morning Light",
          category: "gratitude",
          trigger_source: "manual",
          trigger_metadata: {},
          summary_status: "not_requested",
          summary_text: "",
          intensity_score: null,
          safety_flags: [],
          started_at: "2026-04-30T13:07:03.536886Z",
          last_saved_at: "2026-04-30T13:07:03.536889Z",
          completed_at: null,
          summary_generated_at: null,
          responses: [],
          current_question: null,
        },
      ],
    });

    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const startButton = tree.root.findByProps({
      accessibilityLabel: "Start Reflection",
    });

    await act(async () => {
      await startButton.props.onPress();
    });

    const newSessionButton = tree.root.findByProps({
      accessibilityLabel: "Start New Session",
    });

    await act(async () => {
      await newSessionButton.props.onPress();
    });

    expect(abandonReflectionSession).toHaveBeenCalledWith(44);
    expect(startReflectionSession).toHaveBeenCalledWith({
      template_slug: "journal-1",
      trigger_source: "manual",
      trigger_metadata: {
        entry_point: "reflection_detail",
      },
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_ENTRY,
      params: {
        journalId: "journal-1",
        journalSessionId: "81",
        journalTitle: "The Morning Light",
        journalDescription:
          "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
        journalTags: "gratitude",
        journalDateLabel: "3 MIN",
        journalBenefits: JSON.stringify([
          "Clarify what is present before you move on.",
          "Capture the thought while it still feels honest.",
        ]),
        journalQuestions: JSON.stringify([
          {
            id: 1,
            step_number: 1,
            text: "What is the morning asking you to notice?",
            type: "text",
          },
        ]),
        journalEstimatedMinutes: "3",
        journalTotalSteps: "3",
        journalCategory: "gratitude",
      },
    });
  });
});
