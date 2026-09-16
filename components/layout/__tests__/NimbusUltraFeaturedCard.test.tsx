import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../contexts/ThemeContext";
import { getTheme } from "../../../theme";
import NimbusUltraFeaturedCard from "../NimbusUltraFeaturedCard";

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

const getTextContent = (node: any) =>
  Array.isArray(node.props.children)
    ? node.props.children.join("")
    : node.props.children;

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => getTextContent(node) === value);

function renderCard(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("NimbusUltraFeaturedCard", () => {
  it("renders the featured card with premium hierarchy", () => {
    const tree = renderCard(
      <NimbusUltraFeaturedCard
        title="Moonlit Reset"
        subtitle="7 min · Calm"
        description="A calm reset for the nervous system when the day has been too loud."
        image={{ uri: "https://example.com/moonlit.png" }}
        badge="Curated pick"
        tint="rgba(163,190,140,0.12)"
        accent="#A3BE8C"
        onPress={jest.fn()}
      />
    );

    expect(hasText(tree, "Moonlit Reset")).toBe(true);
    expect(hasText(tree, "7 min · Calm")).toBe(true);
    expect(
      hasText(tree, "A calm reset for the nervous system when the day has been too loud.")
    ).toBe(true);
    expect(hasText(tree, "Curated pick")).toBe(true);
    expect(hasText(tree, "Open")).toBe(true);
  });

  it("opens when pressed", () => {
    const onPress = jest.fn();
    const tree = renderCard(
      <NimbusUltraFeaturedCard
        title="Sleep Drift"
        subtitle="8 min · Sleep"
        description="Let the body grow heavier while the breath becomes quieter."
        image={{ uri: "https://example.com/sleep.png" }}
        badge="For you"
        onPress={onPress}
      />
    );

    const card = tree.root.findByProps({
      accessibilityLabel: "Open Sleep Drift",
    });

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(card.props.accessibilityHint).toBe("Opens the featured item");
  });
});
