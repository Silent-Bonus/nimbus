import React from "react";
import { TextInput } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaOtpCodeInput } from "../SvaOtpCodeInput";

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

function renderOtp(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("SvaOtpCodeInput", () => {
  it("renders one input per digit", () => {
    const tree = renderOtp(
      <SvaOtpCodeInput value="" onChange={jest.fn()} testID="otp" />
    );

    expect(tree.root.findAllByType(TextInput)).toHaveLength(6);
  });

  it("sanitizes pasted values before emitting changes", () => {
    const onChange = jest.fn();
    const tree = renderOtp(
      <SvaOtpCodeInput value="" onChange={onChange} testID="otp" />
    );

    const firstInput = tree.root.findByProps({
      testID: "otp-1",
    }) as any;

    act(() => {
      firstInput.props.onChangeText("12a3456");
    });

    expect(onChange).toHaveBeenCalledWith("123456");
  });
});
