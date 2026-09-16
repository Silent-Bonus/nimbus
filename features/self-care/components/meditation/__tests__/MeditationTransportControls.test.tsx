import React from "react";
import { Text } from "react-native";
import renderer, { act } from "react-test-renderer";

import ThemeContext from "../../../../../contexts/ThemeContext";
import { getTheme } from "../../../../../theme";
import MeditationTransportControls from "../MeditationTransportControls";

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

function renderControls(element: React.ReactElement) {
  return renderer.create(
    <ThemeContext.Provider value={themeValue as any}>
      {element}
    </ThemeContext.Provider>
  );
}

const hasText = (tree: renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join("") === value
        : node.props.children === value
    );

describe("MeditationTransportControls", () => {
  it("renders play controls and triggers callbacks", () => {
    const onSeekBackward = jest.fn();
    const onTogglePlayPause = jest.fn();
    const onSeekForward = jest.fn();

    const tree = renderControls(
      <MeditationTransportControls
        isPlaying={false}
        onSeekBackward={onSeekBackward}
        onTogglePlayPause={onTogglePlayPause}
        onSeekForward={onSeekForward}
      />
    );

    expect(hasText(tree, "Play meditation")).toBe(false);

    const playButton = tree.root.findByProps({
      accessibilityLabel: "Play meditation",
    });
    const backButton = tree.root.findByProps({
      accessibilityLabel: "Seek backward 15 seconds",
    });
    const forwardButton = tree.root.findByProps({
      accessibilityLabel: "Seek forward 15 seconds",
    });

    act(() => {
      backButton.props.onPress();
      playButton.props.onPress();
      forwardButton.props.onPress();
    });

    expect(onSeekBackward).toHaveBeenCalledTimes(1);
    expect(onTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(onSeekForward).toHaveBeenCalledTimes(1);
  });

  it("switches to pause when playback is active", () => {
    const tree = renderControls(
      <MeditationTransportControls
        isPlaying
        onSeekBackward={jest.fn()}
        onTogglePlayPause={jest.fn()}
        onSeekForward={jest.fn()}
      />
    );

    expect(
      tree.root.findByProps({ accessibilityLabel: "Pause meditation" })
        .props.accessibilityRole
    ).toBe("button");
  });
});
