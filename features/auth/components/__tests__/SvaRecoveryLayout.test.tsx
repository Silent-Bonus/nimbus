import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaRecoveryLayout } from "../SvaRecoveryLayout";

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

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

function renderLayout(element: React.ReactElement) {
  return renderer.create(
    <SafeAreaProvider initialMetrics={safeAreaMetrics as any}>
      <ThemeContext.Provider value={themeValue as any}>
        {element}
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}

describe("SvaRecoveryLayout", () => {
  it("renders the recovery title and footer, and invokes back", () => {
    const onBack = jest.fn();

    const tree = renderLayout(
      <SvaRecoveryLayout
        title="Recover Access"
        subtitle="Enter your email to continue."
        onBack={onBack}
        footer={<Text>Footer copy</Text>}
      >
        <Text>Child content</Text>
      </SvaRecoveryLayout>
    );

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Recover Access")
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Footer copy")
    ).toBe(true);

    const backButton = tree.root.findByProps({
      accessibilityLabel: "Go back",
    }) as any;

    act(() => {
      backButton.props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
