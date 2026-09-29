import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import WorkoutListScreen from "../WorkoutListScreen";

const mockGetMoveExercises = jest.fn();
const mockGetMoveExerciseCategories = jest.fn();
const mockGetMoveExerciseDetails = jest.fn();

jest.mock("@/features/self-care/services/selfCareService", () => ({
  getMoveExercises: (...args: any[]) => mockGetMoveExercises(...args),
  getMoveExerciseCategories: (...args: any[]) => mockGetMoveExerciseCategories(...args),
  getMoveExerciseDetails: (...args: any[]) => mockGetMoveExerciseDetails(...args),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const theme = getTheme("sva");
const themeValue = {
  theme: "sva",
  toggleTheme: jest.fn(),
  useSystemTheme: jest.fn(),
  newTheme: theme.colors,
  svaColors: theme.svaColors,
  spacing: theme.spacing,
  svaTypography: theme.svaTypography,
  svaSpacing: theme.svaSpacing,
  svaComponents: theme.svaComponents,
  tokens: theme.tokens,
  activeTheme: theme,
};

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join("") === value
        : node.props.children === value
    );

const exercises = [
  { id: 1, slug: "alignment-flow", title: "Alignment Flow", intent: "yoga", description: "Move with care", reps: "8", duration: "15 min", category: "Yoga", difficulty: "easy" },
  { id: 2, slug: "bodyweight-blitz", title: "Bodyweight Blitz", intent: "cardio", description: "Build stamina", reps: "10", duration: "25 min", category: "Cardio", difficulty: "easy" },
  { id: 3, slug: "iron-core-strength", title: "Iron Core Strength", intent: "strength", description: "Build strength", reps: "10", duration: "20 min", category: "Strength", difficulty: "easy" },
  { id: 4, slug: "heart-rate-hero", title: "Heart Rate Hero", intent: "cardio", description: "Raise your heart rate", reps: "10", duration: "35 min", category: "Cardio", difficulty: "easy" },
];

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <WorkoutListScreen />
      </ThemeContext.Provider>
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("WorkoutListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMoveExercises.mockImplementation(async ({ category } = {}) => ({
      success: true,
      message: "ok",
      data: category && category !== "All"
        ? exercises.filter((exercise) => exercise.category.toLowerCase() === category.toLowerCase())
        : exercises,
      pagination: { count: exercises.length, next: null, previous: null, page: 1, page_size: 20, total_pages: 1, results_count: exercises.length },
    }));
    mockGetMoveExerciseCategories.mockResolvedValue({ success: true, message: "ok", data: ["Cardio", "Strength", "Yoga"] });
    mockGetMoveExerciseDetails.mockImplementation(async (id: string | number) => ({
      success: true,
      message: "ok",
      data: exercises.find((exercise) => String(exercise.id) === String(id)),
    }));
  });

  it("renders the workout library header, filters, and curated cards", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Workouts")).toBe(true);
    expect(
      hasText(
        tree,
        "Find your rhythm in the silence. Move with intention, breathe with grace."
      )
    ).toBe(true);
    expect(hasText(tree, "All")).toBe(true);
    expect(hasText(tree, "Cardio")).toBe(true);
    expect(hasText(tree, "Strength")).toBe(true);
    expect(hasText(tree, "Yoga")).toBe(true);
    expect(hasText(tree, "Alignment Flow")).toBe(true);
    expect(hasText(tree, "Bodyweight Blitz")).toBe(true);
    expect(hasText(tree, "Iron Core Strength")).toBe(true);
    expect(hasText(tree, "Heart Rate Hero")).toBe(true);
    expect(hasText(tree, "Start Session")).toBe(true);
  });

  it("filters the workout cards by category", async () => {
    const tree = await renderScreen();

    const strengthFilter = tree.root.findByProps({
      accessibilityLabel: "Strength",
    });

    await act(async () => {
      strengthFilter.props.onPress();
      await Promise.resolve();
    });

    expect(hasText(tree, "Iron Core Strength")).toBe(true);
    expect(hasText(tree, "Alignment Flow")).toBe(false);
    expect(hasText(tree, "Bodyweight Blitz")).toBe(false);
    expect(hasText(tree, "Heart Rate Hero")).toBe(false);
  });

  it("opens the workout session screen when a card is tapped", async () => {
    const tree = await renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Open session for Alignment Flow",
    });

    await act(async () => {
      card.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      pathname: "/(auth)/self-care/workoutSession",
      params: expect.objectContaining({
        id: "1",
        title: "Alignment Flow",
        subtitle: "15 min · Easy",
        durationSeconds: "900",
      }),
    }));
  });
});
