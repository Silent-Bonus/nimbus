import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { getTheme } from "@/theme";

import OnboardingQuestionsScreen from "../OnboardingQuestionsScreen";
import {
  buildDoshaResponseItem,
  buildDoshaSubmissionPayload,
  fetchPersonaQuestions,
  submitPersonaAnswers,
} from "../../services/onboardingService";

const mockReplace = jest.fn();
const mockSetOptions = jest.fn();
const mockResetToPublic = jest.fn();
const mockMarkOnboardingDone = jest.fn();
const mockGetUserDetails = jest.fn();

jest.mock("expo-router", () => ({
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    resetToPublic: mockResetToPublic,
    markOnboardingDone: mockMarkOnboardingDone,
    getUserDetails: mockGetUserDetails,
  }),
}));

jest.mock("../../services/onboardingService", () => {
  const actual = jest.requireActual("../../services/onboardingService");

  return {
    ...actual,
    fetchPersonaQuestions: jest.fn(),
    submitPersonaAnswers: jest.fn(),
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

const mockFetchPersonaQuestions = fetchPersonaQuestions as jest.MockedFunction<
  typeof fetchPersonaQuestions
>;
const mockSubmitPersonaAnswers = submitPersonaAnswers as jest.MockedFunction<
  typeof submitPersonaAnswers
>;

const questionOne = {
  id: 1,
  category: "Body Structure & Physical Traits",
  question: "Your body frame is usually:",
  options: [
    { id: "A", label: "Thin, light, hard to gain weight" },
    { id: "B", label: "Medium, athletic, well-proportioned" },
    { id: "C", label: "Broad, sturdy, gains weight easily" },
  ],
};

const questionTwo = {
  id: 2,
  category: "Digestion & Appetite",
  question: "Your skin tends to be:",
  options: [
    { id: "A", label: "Dry, rough, thin, or easily dehydrated" },
    { id: "B", label: "Warm, sensitive, oily, or prone to redness" },
    { id: "C", label: "Smooth, thick, moist, and naturally well-hydrated" },
  ],
};

function getTextContent(node: any) {
  return Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;
}

function hasText(tree: renderer.ReactTestRenderer, value: string) {
  return tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);
}

function getBackButtons(tree: renderer.ReactTestRenderer) {
  return tree.root.findAll(
    (node) => node.type === Pressable && node.props?.testID === "onboarding-back-button"
  );
}

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <OnboardingQuestionsScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
    await Promise.resolve();
  });

  return tree;
}

describe("OnboardingQuestionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetchPersonaQuestions.mockResolvedValue({
      success: true,
      message: "Questions loaded",
      data: [questionOne as any, questionTwo as any],
    });
    mockSubmitPersonaAnswers.mockResolvedValue({
      success: true,
      message: "Saved",
      data: { ok: true },
    });
    mockGetUserDetails.mockResolvedValue({ success: true });
    mockMarkOnboardingDone.mockResolvedValue(undefined);
    mockResetToPublic.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the first question without a back button, auto-advances on option tap, and submits the payload on the last step", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockFetchPersonaQuestions).toHaveBeenCalledTimes(1);
    expect(hasText(tree, questionOne.question)).toBe(true);
    expect(hasText(tree, questionTwo.question)).toBe(false);
    expect(getBackButtons(tree)).toHaveLength(0);

    const firstOption = tree.root.findByProps({ testID: "dosha-option-B" }) as any;

    await act(async () => {
      firstOption.props.onPress();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(hasText(tree, questionOne.question)).toBe(false);
    expect(hasText(tree, questionTwo.question)).toBe(true);
    expect(getBackButtons(tree)).toHaveLength(1);

    const secondOption = tree.root.findByProps({ testID: "dosha-option-C" }) as any;

    await act(async () => {
      secondOption.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSubmitPersonaAnswers).toHaveBeenCalledTimes(1);
    expect(mockSubmitPersonaAnswers).toHaveBeenCalledWith(
      buildDoshaSubmissionPayload([
        buildDoshaResponseItem(questionOne as any, questionOne.options[1] as any),
        buildDoshaResponseItem(questionTwo as any, questionTwo.options[2] as any),
      ])
    );
    expect(mockMarkOnboardingDone).toHaveBeenCalledTimes(1);
    expect(mockGetUserDetails).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTH.SUCCESS_STATE);
  });

  it("goes back to the previous question when the back button is tapped", async () => {
    const tree = await renderScreen();

    const firstOption = tree.root.findByProps({ testID: "dosha-option-B" }) as any;

    await act(async () => {
      firstOption.props.onPress();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    const backButton = tree.root.findByProps({
      testID: "onboarding-back-button",
    }) as any;

    await act(async () => {
      backButton.props.onPress();
      await Promise.resolve();
    });

    expect(hasText(tree, questionOne.question)).toBe(true);
    expect(hasText(tree, questionTwo.question)).toBe(false);
    expect(mockResetToPublic).not.toHaveBeenCalled();
  });
});
