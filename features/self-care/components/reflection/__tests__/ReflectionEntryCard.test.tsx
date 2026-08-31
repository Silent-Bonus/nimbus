import React from "react";
import { Pressable, Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import ReflectionEntryCard from "../ReflectionEntryCard";

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

function renderCard(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

describe("ReflectionEntryCard", () => {
  it("renders the reflection metadata and tag chips", () => {
    const tree = renderCard(
      <ReflectionEntryCard
        item={{
          id: "journal-1",
          title: "The Morning Light",
          description:
            "Today I feel a deep sense of gratitude for the soft amber light filtering through the window.",
          dateLabel: "OCT 24",
          tags: ["gratitude", "mindfulness"],
        }}
        onPress={jest.fn()}
      />
    );

    expect(hasText(tree, "The Morning Light")).toBe(true);
    expect(hasText(tree, "OCT 24")).toBe(true);
    expect(
      hasText(
        tree,
        "Today I feel a deep sense of gratitude for the soft amber light filtering through the window."
      )
    ).toBe(true);
    expect(hasText(tree, "#GRATITUDE")).toBe(true);
    expect(hasText(tree, "#MINDFULNESS")).toBe(true);
  });

  it("calls onPress when the card is tapped", () => {
    const onPress = jest.fn();
    const tree = renderCard(
      <ReflectionEntryCard
        item={{
          id: "journal-2",
          title: "Midnight Reverie",
          description:
            "The silence of the sanctuary tonight is profound and steady.",
          dateLabel: "OCT 23",
          tags: ["reflection", "silence"],
        }}
        onPress={onPress}
      />
    );

    const card = tree.root.findByType(Pressable);

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("exposes an accessible label for the card action", () => {
    const tree = renderCard(
      <ReflectionEntryCard
        item={{
          id: "journal-3",
          title: "Fragmented Waters",
          description: "A few scattered thoughts moved across the page today.",
          dateLabel: "OCT 22",
          tags: ["release", "stillness"],
        }}
        onPress={jest.fn()}
      />
    );

    expect(
      tree.root.findByProps({ accessibilityLabel: "Open Fragmented Waters" })
        .props.accessibilityRole
    ).toBe("button");
  });
});
