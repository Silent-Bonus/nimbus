import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaAuthButton } from "../SvaAuthButton";

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

function renderButton(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("SvaAuthButton", () => {
  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const tree = renderButton(
      <SvaAuthButton
        testID="enter-sanctuary"
        label="Enter Sanctuary"
        onPress={onPress}
        rightIcon={<Text>→</Text>}
      />
    );

    const button = tree.root.findByProps({ testID: "enter-sanctuary" });

    act(() => {
      button.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders loading state and disables interaction", () => {
    const onPress = jest.fn();
    const tree = renderButton(
      <SvaAuthButton
        label="Enter Sanctuary"
        onPress={onPress}
        loading
      />
    );

    const button = tree.root.findByType(Pressable);

    expect(button.props.disabled).toBe(true);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });
});
