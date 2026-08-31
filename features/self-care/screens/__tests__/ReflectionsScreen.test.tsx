import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { ROUTES } from "../../../../constants/routes";
import ReflectionsScreen from "../ReflectionsScreen";
import {
  getReflectionList,
  getReflectionSessionList,
} from "../../services/selfCareService";

const mockPush = jest.fn();
const mockBack = jest.fn();

const mockNavigation = {
  setOptions: jest.fn(),
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => mockNavigation,
}));

jest.mock("../../services/selfCareService", () => ({
  getReflectionList: jest.fn(),
  getReflectionSessionList: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../../utils/date-time", () => ({
  toFriendlyDate: (value: string) =>
    value.includes("2026-04-30T13:07:52") ? "Today" : "Yesterday",
  formatReminderTime: (value: string) =>
    value.includes("2026-04-30T13:07:52") ? "01:07 PM" : "01:06 PM",
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
        <ReflectionsScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("ReflectionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getReflectionList as jest.Mock).mockResolvedValue({
      success: true,
      message: "Templates loaded",
      data: [
        {
          template_id: "anger-template",
          template_slug: "when-you-feel-angry",
          title: "When you feel Angry",
          category: "anger",
          description: "Pause before the heat takes over.",
          benefits: ["Notice the boundary beneath the reaction."],
          icon: "flame-outline",
          estimated_minutes: 4,
          total_steps: 5,
          questions: [],
        },
        {
          template_id: "gratitude-template",
          template_slug: "gratitude-close",
          title: "Gratitude Close",
          category: "gratitude",
          description: "Close the day with one clear point of thanks.",
          benefits: ["End the day softer."],
          icon: "sunny-outline",
          estimated_minutes: 3,
          total_steps: 5,
          questions: [],
        },
      ],
    });

    (getReflectionSessionList as jest.Mock).mockResolvedValue({
      success: true,
      message: "Sessions loaded",
      data: [
        {
          id: 3,
          status: "in_progress",
          current_step: 3,
          total_steps: 5,
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
          last_saved_at: "2026-04-30T13:07:52.458634Z",
          completed_at: null,
          summary_generated_at: null,
          responses: [],
          current_question: null,
        },
        {
          id: 1,
          status: "draft",
          current_step: 1,
          total_steps: 5,
          template_slug: "shadow-session",
          template_title: "Shadow Session",
          category: "anxiety",
          trigger_source: "manual",
          trigger_metadata: {},
          summary_status: "not_requested",
          summary_text: "",
          intensity_score: null,
          safety_flags: [],
          started_at: "2026-04-30T13:06:03.533189Z",
          last_saved_at: "2026-04-30T13:06:03.533195Z",
          completed_at: null,
          summary_generated_at: null,
          responses: [],
          current_question: null,
        },
      ],
    });
  });

  it("renders the in-progress section above the reflection templates", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(getReflectionSessionList).toHaveBeenCalledWith({
      status: "in_progress",
    });
    expect(hasText(tree, "In Progress Sessions")).toBe(true);
    expect(hasText(tree, "Continue Session")).toBe(true);
    expect(hasText(tree, "Open")).toBe(true);
    expect(hasText(tree, "When you feel Angry")).toBe(true);
    expect(hasText(tree, "Shadow Session")).toBe(true);
    expect(hasText(tree, "Gratitude Close")).toBe(true);
  });

  it("passes the session id to detail when continuing a matched session", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const buttons = tree.root.findAllByType(Pressable);
    const continueButton = buttons.find(
      (node) =>
        node.props.accessibilityLabel ===
        "Continue Session When you feel Angry"
    );

    expect(continueButton).toBeTruthy();

    await act(async () => {
      continueButton?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_DETAIL,
      params: {
        journalSlug: "when-you-feel-angry",
        journalSessionId: "3",
      },
    });
  });

  it("opens unmatched sessions without passing a session id", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const buttons = tree.root.findAllByType(Pressable);
    const openButton = buttons.find(
      (node) => node.props.accessibilityLabel === "Open Shadow Session"
    );

    expect(openButton).toBeTruthy();

    await act(async () => {
      openButton?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.SELF_CARE_REFLECTION_DETAIL,
      params: {
        journalSlug: "shadow-session",
      },
    });
  });
});
