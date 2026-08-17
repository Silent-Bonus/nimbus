import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import MeditationTemplateCard from "../MeditationTemplateCard";

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

function renderCard(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) => {
      const content = Array.isArray(node.props.children)
        ? node.props.children.join("")
        : String(node.props.children ?? "");

      return content.includes(value);
    });

describe("MeditationTemplateCard", () => {
  it("renders the meditation list card metadata and open action", () => {
    const tree = renderCard(
      <MeditationTemplateCard
        item={{
          id: "moonlit-reset",
          title: "Moonlit Reset",
          description: "A calm reset for the nervous system.",
          tags: ["Calm"],
          durationLabel: "7 min",
          image: { uri: "https://example.com/moonlit.png" },
          isLocked: false,
        }}
        onPress={jest.fn()}
      />
    );

    expect(hasText(tree, "Moonlit Reset")).toBe(true);
    expect(hasText(tree, "A calm reset for the nervous system.")).toBe(true);
    expect(hasText(tree, "Calm")).toBe(true);
    expect(hasText(tree, "7 min")).toBe(true);
    expect(hasText(tree, "Open")).toBe(true);
  });

  it("calls onPress when the meditation card is tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(
      <MeditationTemplateCard
        item={{
          id: "sleep-drift",
          title: "Sleep Drift",
          description: "Let the body grow heavier.",
          tags: ["Sleep"],
          durationLabel: "8 min",
          image: { uri: "https://example.com/sleep.png" },
          isLocked: false,
        }}
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
  });

  it("marks locked meditations as disabled", () => {
    const tree = renderCard(
      <MeditationTemplateCard
        item={{
          id: "stillness-anchor",
          title: "Stillness Anchor",
          description: "Use the breath to slow the edges of the day.",
          tags: ["Breath"],
          durationLabel: "5 min",
          image: { uri: "https://example.com/stillness.png" },
          isLocked: true,
        }}
        onPress={jest.fn()}
      />
    );

    const card = tree.root.findByProps({
      accessibilityLabel: "Open Stillness Anchor",
    });

    expect(card.props.disabled).toBe(true);
    expect(card.props.accessibilityState).toEqual({ disabled: true });
    expect(hasText(tree, "Locked")).toBe(true);
  });
});
