import React from "react";
import { StyleSheet, Text, View } from "react-native";
import renderer, { act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaAuthLayout } from "../SvaAuthLayout";

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

describe("SvaAuthLayout", () => {
  it("renders the SVA header, progress fill, and invokes back", () => {
    const onBack = jest.fn();
    const tree = renderLayout(
      <SvaAuthLayout step={2} total={4} onBack={onBack}>
        <View>
          <Text>Child content</Text>
        </View>
      </SvaAuthLayout>
    );

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "SVA")
    ).toBe(true);

    const progressFill = tree.root.findByProps({
      testID: "auth-progress-fill",
    }) as any;

    expect(StyleSheet.flatten(progressFill.props.style).width).toBe("50%");

    const backButton = tree.root.findByProps({
      accessibilityLabel: "Go back",
    }) as any;

    act(() => {
      backButton.props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
