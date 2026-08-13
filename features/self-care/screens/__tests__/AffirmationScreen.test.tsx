import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import AffirmationScreen from "../AffirmationScreen";
import {
  consumeQueuedCreatedAffirmation,
  queueCreatedAffirmation,
} from "@/features/self-care/data/affirmationCreationInbox";
import {
  getAffirmations,
  getAffirmationBySlug,
} from "@/features/self-care/services/affirmationService";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
let mockFocusEffect: (() => void) | undefined;

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useFocusEffect: (callback: () => void) => {
    const React = require("react");

    mockFocusEffect = callback;
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = jest.requireActual("react-native");

  return {
    Ionicons: (props: any) => React.createElement(View, props),
    MaterialCommunityIcons: (props: any) => React.createElement(View, props),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = jest.requireActual("react-native");

  return {
    LinearGradient: (props: any) => React.createElement(View, props),
  };
});

jest.mock("react-native", () =>
  require("../../components/affirmation/mockReactNative")
);

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/features/self-care/services/affirmationService", () => {
  const actual = jest.requireActual(
    "@/features/self-care/services/affirmationService"
  );

  return {
    ...actual,
    getAffirmations: jest.fn(),
    getAffirmationBySlug: jest.fn(),
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

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join("") === value
        : node.props.children === value
    );

const AFFIRMATION_DECK_FIXTURE = {
  cards: [
    {
      id: "quiet-power-ii",
      title: "Quiet Power ii",
      tone: "Confidence",
      toneCategory: "confidence",
      quote: "Steady energy is stronger than rushed effort.",
      storyQuote:
        "Steady energy is stronger than rushed effort.\nCalm repetition builds real confidence.",
      statements: [
        "Steady energy is stronger than rushed effort.",
        "Calm repetition builds real confidence.",
      ],
      tags: ["focus", "study"],
      detail: "A cleaner rhythm for focus, study, and follow-through.",
      paletteKey: "confidence",
    },
    {
      id: "quiet-power",
      title: "Quiet Power",
      tone: "Calmness",
      toneCategory: "calm",
      quote: "I can move slowly and still arrive with clarity.",
      storyQuote: "I can move slowly and still arrive with clarity.",
      statements: ["I can move slowly and still arrive with clarity."],
      tags: ["calm"],
      detail: "A softer cadence for clear next steps.",
      paletteKey: "calm",
    },
  ],
  recommendations: [
    {
      id: "quiet-power-ii",
      tone: "Confidence",
      toneCategory: "confidence",
      title: "Quiet Power ii",
      affirmation:
        "Steady energy is stronger than rushed effort.\nCalm repetition builds real confidence.",
      detail: "A cleaner rhythm for focus, study, and follow-through.",
      tag: "Focus",
      palette: {
        colors: ["#EFE8FF", "#CEBCFB"],
        accent: "#6A55A4",
        accentSoft: "rgba(106, 85, 164, 0.16)",
        text: "#241A39",
        tagBg: "rgba(255, 255, 255, 0.60)",
        tagBorder: "rgba(36, 26, 57, 0.10)",
        tagText: "#6A55A4",
      },
    },
    {
      id: "quiet-power",
      tone: "Calmness",
      toneCategory: "calm",
      title: "Quiet Power",
      affirmation: "I can move slowly and still arrive with clarity.",
      detail: "A softer cadence for clear next steps.",
      tag: "Calmness",
      palette: {
        colors: ["#EAF4FF", "#BAD4F1"],
        accent: "#2F628E",
        accentSoft: "rgba(47, 98, 142, 0.18)",
        text: "#132235",
        tagBg: "rgba(255, 255, 255, 0.62)",
        tagBorder: "rgba(19, 34, 53, 0.10)",
        tagText: "#2F628E",
      },
    },
  ],
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    void rej;
  });

  return { promise, resolve };
}

async function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <AffirmationScreen />
      </ThemeContext.Provider>
    );

    await Promise.resolve();
  });

  await act(async () => {
    await Promise.resolve();
  });

  return tree;
}

function renderScreenImmediately() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <AffirmationScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("AffirmationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect = undefined;
    consumeQueuedCreatedAffirmation();
    (getAffirmations as jest.Mock).mockResolvedValue(AFFIRMATION_DECK_FIXTURE);
    (getAffirmationBySlug as jest.Mock).mockResolvedValue({
      card: {
        id: "quiet-power",
        title: "Quiet Power",
        tone: "Confidence",
        toneCategory: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        statements: [
          "Steady energy is stronger than rushed effort.",
          "Calm repetition builds real confidence.",
        ],
        tags: ["focus", "study"],
        detail: "Fetched detail for quiet-power.",
        paletteKey: "confidence",
      },
      recommendation: {
        id: "quiet-power",
        tone: "Confidence",
        toneCategory: "confidence",
        title: "Quiet Power",
        affirmation: "Steady energy is stronger than rushed effort.",
        detail: "Fetched detail for quiet-power.",
        tag: "Confidence",
        palette: {
          colors: ["#EFE8FF", "#CEBCFB"],
          accent: "#6A55A4",
          accentSoft: "rgba(106, 85, 164, 0.16)",
          text: "#241A39",
          tagBg: "rgba(255, 255, 255, 0.60)",
          tagBorder: "rgba(36, 26, 57, 0.10)",
          tagText: "#6A55A4",
        },
      },
    });
  });

  it("renders the recommendation row and list content", async () => {
    const tree = await renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(getAffirmations).toHaveBeenCalledTimes(1);

    expect(hasText(tree, "Affirmations")).toBe(true);
    expect(hasText(tree, "RECOMMENDED LINE")).toBe(true);
    expect(hasText(tree, "Quiet Power ii")).toBe(true);
    expect(
      hasText(
        tree,
        "Steady energy is stronger than rushed effort.\nCalm repetition builds real confidence."
      )
    ).toBe(true);
    expect(hasText(tree, "2 affirmations")).toBe(true);
  });

  it("shows a skeleton while the affirmation list is loading", () => {
    const deferred = createDeferred<typeof AFFIRMATION_DECK_FIXTURE>();
    (getAffirmations as jest.Mock).mockReturnValueOnce(deferred.promise);

    const tree = renderScreenImmediately();

    expect(
      tree.root.findByProps({ testID: "affirmation-library-skeleton" })
    ).toBeTruthy();
  });

  it("shows a retryable error state when the list request fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (getAffirmations as jest.Mock)
      .mockRejectedValueOnce(new Error("backend timeout"))
      .mockResolvedValueOnce(AFFIRMATION_DECK_FIXTURE);

    const tree = await renderScreen();

    expect(hasText(tree, "Couldn't load affirmations")).toBe(true);
    expect(hasText(tree, "backend timeout")).toBe(true);

    const retryButton = tree.root.findByProps({
      testID: "affirmation-retry-button",
    });

    await act(async () => {
      await retryButton.props.onPress();
    });

    expect(getAffirmations).toHaveBeenCalledTimes(2);
    expect(hasText(tree, "Quiet Power ii")).toBe(true);
    warnSpy.mockRestore();
  });

  it("adds a newly created affirmation back into the list on return", async () => {
    const tree = await renderScreen();

    queueCreatedAffirmation({
      card: {
        id: "soft-return",
        title: "Soft Return",
        tone: "Reset",
        toneCategory: "reset",
        quote: "I can move gently and still make progress.",
        detail: "A softer line for coming back to the work.",
        paletteKey: "reset",
      },
      recommendation: {
        id: "soft-return",
        tone: "Reset",
        toneCategory: "reset",
        title: "Soft Return",
        affirmation: "I can move gently and still make progress.",
        detail: "A softer line for coming back to the work.",
        tag: "Reset",
        palette: {
          colors: ["#F8E4E0", "#F0B7C5"],
          accent: "#A14668",
          accentSoft: "rgba(161, 70, 104, 0.16)",
          text: "#2D1822",
          tagBg: "rgba(255, 255, 255, 0.58)",
          tagBorder: "rgba(45, 24, 34, 0.10)",
          tagText: "#A14668",
        },
      },
    });

    await act(async () => {
      mockFocusEffect?.();
      await Promise.resolve();
    });

    expect(hasText(tree, "Soft Return")).toBe(true);
    expect(hasText(tree, "3 affirmations")).toBe(true);
  });

  it("opens the story modal and fetches the clicked affirmation detail", async () => {
    const tree = await renderScreen();

    const card = tree.root.findByProps({
      accessibilityLabel: "Choose affirmation Quiet Power",
    });

    await act(async () => {
      await card.props.onPress();
    });

    expect(getAffirmationBySlug).toHaveBeenCalledWith("quiet-power");
    expect(hasText(tree, "AFFIRMATION")).toBe(true);
    expect(hasText(tree, "1/2")).toBe(true);
    expect(
      hasText(
        tree,
        "Open one affirmation and move through it statement by statement."
      )
    ).toBe(true);
    expect(hasText(tree, "focus")).toBe(true);
    expect(hasText(tree, "study")).toBe(true);
    expect(hasText(tree, "Fetched detail for quiet-power.")).toBe(true);
  });

  it("opens the custom affirmation screen from the pencil action", async () => {
    const tree = await renderScreen();

    const pencil = tree.root.findByProps({
      accessibilityLabel: "Create custom affirmation",
    });

    act(() => {
      pencil.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith(
      ROUTES.AUTH.SELF_CARE_CREATE_AFFIRMATION
    );
  });
});
