import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import CreateAffirmationScreen from "../CreateAffirmationScreen";
import { createAffirmation } from "@/features/self-care/services/affirmationService";
import { queueCreatedAffirmation } from "@/features/self-care/data/affirmationCreationInbox";

const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockToastShow = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = jest.requireActual("react-native");

  return {
    Ionicons: (props: any) => React.createElement(View, props),
    MaterialCommunityIcons: (props: any) => React.createElement(View, props),
  };
});

jest.mock("@/features/self-care/services/affirmationService", () => {
  const actual = jest.requireActual(
    "@/features/self-care/services/affirmationService"
  );

  return {
    ...actual,
    createAffirmation: jest.fn(),
  };
});

jest.mock("@/features/self-care/data/affirmationCreationInbox", () => ({
  queueCreatedAffirmation: jest.fn(),
}));

jest.mock("@/components/ui/toast/useNimbusToast", () => ({
  useNimbusToast: () => ({
    show: mockToastShow,
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

const getStatementInputs = (tree: renderer.ReactTestRenderer) =>
  Array.from(
    new Map(
      tree.root
        .findAll(
          (node) =>
            typeof node.props.testID === "string" &&
            node.props.testID.startsWith("affirmation-statement-input-")
        )
        .map((node) => [node.props.testID as string, node])
    ).values()
  ) as renderer.ReactTestInstance[];

function renderScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={themeValue as any}>
        <CreateAffirmationScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("CreateAffirmationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAffirmation as jest.Mock).mockResolvedValue({
      card: {
        id: "quiet-power-ii",
        tone: "confidence",
        quote: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        paletteKey: "clear-steps",
      },
      recommendation: {
        id: "quiet-power-ii",
        tone: "confidence",
        title: "Quiet Power ii",
        affirmation: "Steady energy is stronger than rushed effort.",
        detail: "A cleaner rhythm for focus, study, and follow-through.",
        tag: "Focus",
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
      source: "api",
      message: "Affirmation created successfully.",
    });
  });

  it("renders the custom affirmation form with three statement inputs", () => {
    const tree = renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });

    expect(hasText(tree, "Create Affirmation")).toBe(true);
    expect(hasText(tree, "CUSTOM DECK")).toBe(true);
    expect(hasText(tree, "Quote detail")).toBe(true);
    expect(getStatementInputs(tree)).toHaveLength(3);

    const addButton = tree.root.findByProps({
      testID: "add-statement-button",
    });
    expect(addButton.props.disabled).toBe(false);
  });

  it("adds statements up to seven and then locks the add action", () => {
    const tree = renderScreen();

    const addButton = tree.root.findByProps({
      testID: "add-statement-button",
    });

    act(() => {
      addButton.props.onPress();
      addButton.props.onPress();
      addButton.props.onPress();
      addButton.props.onPress();
    });

    expect(getStatementInputs(tree)).toHaveLength(7);

    const disabledAddButton = tree.root.findByProps({
      testID: "add-statement-button",
    });
    expect(disabledAddButton.props.disabled).toBe(true);
    expect(hasText(tree, "Maximum 7 reached")).toBe(true);
  });

  it("submits the custom affirmation and returns to the affirmation screen", async () => {
    const tree = renderScreen();

    act(() => {
      tree.root.findByProps({
        testID: "affirmation-title-input",
      }).props.onChangeText("Soft Return");
      tree.root.findByProps({
        testID: "affirmation-tag-input",
      }).props.onChangeText("focus, study");
      tree.root.findByProps({
        testID: "affirmation-detail-input",
      }).props.onChangeText(
        "A cleaner rhythm for focus, study, and follow-through."
      );
      tree.root.findByProps({
        testID: "affirmation-statement-input-0",
      }).props.onChangeText("I can move gently and still make progress.");
      tree.root.findByProps({
        testID: "affirmation-statement-input-1",
      }).props.onChangeText("My pace can be soft and still be strong.");
      tree.root.findByProps({
        testID: "affirmation-statement-input-2",
      }).props.onChangeText("What I build with care will hold.");
    });

    const createButton = tree.root.findByProps({
      testID: "create-affirmation-button",
    });

    await act(async () => {
      await createButton.props.onPress();
    });

    expect(createAffirmation).toHaveBeenCalledWith({
      title: "Soft Return",
      tone: "confidence",
      tags: ["focus", "study"],
      statements: [
        "I can move gently and still make progress.",
        "My pace can be soft and still be strong.",
        "What I build with care will hold.",
      ],
      quote_detail: "A cleaner rhythm for focus, study, and follow-through.",
    });
    expect(queueCreatedAffirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendation: expect.objectContaining({
          id: "quiet-power-ii",
        }),
      })
    );
    expect(mockBack).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "Affirmation created",
        message: "Affirmation created successfully.",
      })
    );
  });
});
