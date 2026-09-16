import React from "react";
import { Text, TextInput } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaAuthInput } from "../SvaAuthInput";

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

function renderInput(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("SvaAuthInput", () => {
  it("renders the label, placeholder, and helper/error text", () => {
    const tree = renderInput(
      <SvaAuthInput
        label="MEMBER ID"
        placeholder="Enter your unique ID"
        helperText="Use the id from your invite."
        value=""
        onChangeText={jest.fn()}
        testID="member-id-input"
      />
    );

    const input = tree.root.findByProps({ testID: "member-id-input" });

    expect(input.props.placeholder).toBe("Enter your unique ID");
    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "MEMBER ID")
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Use the id from your invite.")
    ).toBe(true);
  });

  it("renders a label accessory", () => {
    const tree = renderInput(
      <SvaAuthInput
        label="ACCESS KEY"
        labelAccessory={<Text>Tip</Text>}
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Tip")
    ).toBe(true);
  });

  it("toggles secure text entry for password fields", () => {
    const tree = renderInput(
      <SvaAuthInput
        label="ACCESS CODE"
        preset="password"
        placeholder="••••••••"
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);

    const toggle = tree.root.findByProps({
      accessibilityLabel: "Show access code",
    }) as any;

    act(() => {
      toggle.props.onPress();
    });

    expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(false);
  });
});
