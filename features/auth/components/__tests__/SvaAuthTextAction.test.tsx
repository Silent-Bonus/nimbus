import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../contexts/ThemeContext";
import { getTheme } from "../../../../theme";
import { SvaAuthTextAction } from "../SvaAuthTextAction";

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

function renderAction(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("SvaAuthTextAction", () => {
  it("renders text and invokes onPress", () => {
    const onPress = jest.fn();
    const tree = renderAction(
      <SvaAuthTextAction onPress={onPress}>Try another way</SvaAuthTextAction>
    );

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Try another way")
    ).toBe(true);

    const action = tree.root.findByProps({
      accessibilityRole: "button",
    }) as any;

    act(() => {
      action.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders secondary content when provided", () => {
    const tree = renderAction(
      <SvaAuthTextAction
        onPress={jest.fn()}
        secondaryContent={<Text>Decor</Text>}
      >
        Lost Access
      </SvaAuthTextAction>
    );

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Lost Access")
    ).toBe(true);

    expect(
      tree.root
        .findAllByType(Text)
        .some((node) => node.props.children === "Decor")
    ).toBe(true);
  });
});
