import React from "react";
import { Text, View } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { ROUTES } from "../../../../constants/routes";
import { getTheme } from "../../../../theme";
import CuratedManifestDetailScreen from "../CuratedManifestDetailScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetOptions = jest.fn();
const mockOpenGate = jest.fn();

const mockNavigation = {
  setOptions: mockSetOptions,
};

let mockAccessState: "preview" | "locked" | "allowed" = "preview";
let mockParams = { id: "agni-reset" };

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  useNavigation: () => mockNavigation,
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../../contexts/PremiumGateContext", () => ({
  usePremiumGate: () => ({
    openGate: (...args: any[]) => mockOpenGate(...args),
    closeGate: jest.fn(),
    getAccessState: () => mockAccessState,
    canAccess: () => mockAccessState === "allowed",
    activeGate: null,
  }),
}));

jest.mock("../../../../components/ui/Themed", () => ({
  ScreenView: ({ children, ...props }: any) => {
    const React = require("react");
    const { View } = require("react-native");

    return React.createElement(View, props, children);
  },
}));

jest.mock("../../../../components/layout/ScreenHeader", () => ({
  __esModule: true,
  default: ({ title }: any) => {
    const React = require("react");
    const { Text } = require("react-native");

    return React.createElement(Text, null, title);
  },
}));

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

jest.mock(
  "../../../../features/tools/components/curated-manifest-detail/ManifestHero",
  () => ({
    __esModule: true,
    default: ({ title }: any) => {
      const React = require("react");
      const { Text } = require("react-native");

      return React.createElement(Text, null, title);
    },
  })
);

jest.mock(
  "../../../../features/tools/components/curated-manifest-detail/ManifestStatGrid",
  () => ({
    __esModule: true,
    default: ({ items }: any) => {
      const React = require("react");
      const { Text, View } = require("react-native");

      return React.createElement(
        View,
        null,
        items.map((item: any) =>
          React.createElement(Text, { key: item.label }, item.label)
        )
      );
    },
  })
);

jest.mock(
  "../../../../features/tools/components/curated-manifest-detail/ManifestSection",
  () => ({
    __esModule: true,
    default: ({ title, children }: any) => {
      const React = require("react");
      const { Text, View } = require("react-native");

      return React.createElement(
        View,
        null,
        React.createElement(Text, null, title),
        children
      );
    },
  })
);

jest.mock(
  "../../../../features/tools/components/curated-manifest-detail/BenefitList",
  () => ({
    __esModule: true,
    default: ({ items }: any) => {
      const React = require("react");
      const { Text, View } = require("react-native");

      return React.createElement(
        View,
        null,
        items.map((item: string) =>
          React.createElement(Text, { key: item }, item)
        )
      );
    },
  })
);

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
        <CuratedManifestDetailScreen />
      </ThemeContext.Provider>
    );
  });

  return tree;
}

describe("CuratedManifestDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: "agni-reset" };
    mockAccessState = "preview";
  });

  it("opens the gate on entry for preview users and opens the locked modal from the CTA", () => {
    const tree = renderScreen();

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerShown: false,
    });
    expect(mockOpenGate).toHaveBeenCalledWith(
      "curated_manifest_detail",
      "screen_entry"
    );
    expect(hasText(tree, "Unlock Protocol Stack")).toBe(true);

    const ctaButton = tree.root.findByProps({
      accessibilityLabel: "Unlock Protocol Stack",
    });

    act(() => {
      ctaButton.props.onPress();
    });

    expect(mockOpenGate).toHaveBeenCalledWith(
      "curated_manifest_protocols",
      "cta_press"
    );
  });

  it("routes directly to the protocol stack for premium users", () => {
    mockAccessState = "allowed";

    const tree = renderScreen();

    expect(mockOpenGate).not.toHaveBeenCalledWith(
      "curated_manifest_detail",
      "screen_entry"
    );
    expect(hasText(tree, "View Protocol Stack")).toBe(true);

    const ctaButton = tree.root.findByProps({
      accessibilityLabel: "View Protocol Stack",
    });

    act(() => {
      ctaButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.AUTH.TOOLS_CURATED_MANIFEST_PROTOCOLS,
      params: { id: "agni-reset" },
    });
  });
});
