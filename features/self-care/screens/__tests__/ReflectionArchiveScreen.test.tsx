import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import ReflectionArchiveScreen from "../ReflectionArchiveScreen";
import { getReflectionSessionList } from "../../services/selfCareService";

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
  getReflectionSessionList: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../../utils/date-time", () => ({
  toFriendlyDate: (value: string) =>
    value.includes("2026-04-30T13:09:09") ? "Today" : "Yesterday",
  formatReminderTime: (value: string) =>
    value.includes("2026-04-30T13:09:09") ? "01:09 PM" : "01:07 PM",
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
        <ReflectionArchiveScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("ReflectionArchiveScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getReflectionSessionList as jest.Mock).mockImplementation((params?: {
      status?: string | string[];
    }) => {
      const allSessions = [
        {
          id: 5,
          status: "completed",
          current_step: 5,
          total_steps: 5,
          template_slug: "when-you-feel-like-overeating",
          template_title: "When you feel like Overeating",
          category: "overeating",
          trigger_source: "manual",
          trigger_metadata: {},
          summary_status: "failed",
          summary_text: "",
          intensity_score: null,
          safety_flags: [],
          started_at: "2026-04-30T13:09:09.548274Z",
          last_saved_at: "2026-04-30T13:09:09.621652Z",
          completed_at: "2026-04-30T13:09:09.621621Z",
          summary_generated_at: null,
          responses: [],
          current_question: null,
        },
        {
          id: 3,
          status: "in_progress",
          current_step: 5,
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
          current_step: 2,
          total_steps: 5,
          template_slug: "when-you-feel-anxious",
          template_title: "When you feel Anxious",
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
      ];

      const statuses = Array.isArray(params?.status)
        ? params?.status
        : params?.status
          ? [params.status]
          : [];
      const filtered =
        statuses.includes("completed")
          ? allSessions.filter((session) => session.status === "completed")
          : statuses.some((status) => ["draft", "in_progress"].includes(status))
            ? allSessions.filter((session) =>
                ["draft", "in_progress"].includes(session.status)
              )
            : allSessions;

      return Promise.resolve({
        success: true,
        message: "Reflect sessions retrieved successfully.",
        data: filtered,
      });
    });
  });

  it("renders the session archive header and session cards", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    expect(mockNavigation.setOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Reflection Archive")).toBe(true);
    expect(
      hasText(tree, "Resume active sessions or revisit completed ones.")
    ).toBe(true);
    expect(hasText(tree, "When you feel like Overeating")).toBe(true);
    expect(hasText(tree, "When you feel Angry")).toBe(true);
    expect(hasText(tree, "When you feel Anxious")).toBe(true);
    expect(hasText(tree, "In Progress")).toBe(true);
    expect(hasText(tree, "Completed")).toBe(true);
    expect(hasText(tree, "TODAY · 01:09 PM")).toBe(true);
    expect(hasText(tree, "YESTERDAY · 01:07 PM")).toBe(true);
    expect(getReflectionSessionList).toHaveBeenLastCalledWith(undefined);
  });

  it("filters the session list by status pills", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const inProgressPill = tree.root.findByProps({
      accessibilityLabel: "In Progress",
    });

    await act(async () => {
      inProgressPill.props.onPress();
    });

    expect(hasText(tree, "When you feel Angry")).toBe(true);
    expect(hasText(tree, "When you feel Anxious")).toBe(true);
    expect(hasText(tree, "When you feel like Overeating")).toBe(false);
    expect(getReflectionSessionList).toHaveBeenLastCalledWith({
      status: ["in_progress", "draft"],
    });

    const completedPill = tree.root.findByProps({
      accessibilityLabel: "Completed",
    });

    await act(async () => {
      completedPill.props.onPress();
    });

    expect(hasText(tree, "When you feel like Overeating")).toBe(true);
    expect(hasText(tree, "When you feel Angry")).toBe(false);
    expect(hasText(tree, "When you feel Anxious")).toBe(false);
    expect(getReflectionSessionList).toHaveBeenLastCalledWith({
      status: ["completed"],
    });
  });

  it("opens the detail screen for an in-progress session", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const cards = tree.root.findAllByType(Pressable);
    const sessionCard = cards.find(
      (node) => node.props.accessibilityLabel === "Open When you feel Angry"
    );

    expect(sessionCard).toBeTruthy();

    await act(async () => {
      sessionCard?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/self-care/reflections/detail/[journalSlug]",
      params: {
        journalSlug: "when-you-feel-angry",
        journalSessionId: "3",
      },
    });
  });

  it("opens the review screen for a completed session", async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderScreen();
    });

    const cards = tree.root.findAllByType(Pressable);
    const sessionCard = cards.find(
      (node) =>
        node.props.accessibilityLabel ===
        "Open When you feel like Overeating"
    );

    expect(sessionCard).toBeTruthy();

    await act(async () => {
      sessionCard?.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/self-care/reflections/submission",
      params: {
        journalSessionId: "5",
      },
    });
  });
});
