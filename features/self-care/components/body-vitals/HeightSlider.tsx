import React, { useContext, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

import ThemeContext from "@/contexts/ThemeContext";
import {
  HEIGHT_MAX_CM,
  HEIGHT_MIN_CM,
} from "@/features/self-care/utils/bodyVitalsUtils";
import type { ColorSet, Spacing } from "@/theme/types";

type HeightSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export const HeightSlider = ({ value, onChange }: HeightSliderProps) => {
  const { newTheme, spacing } = useContext(ThemeContext);

  const styles = useMemo(
    () => styling(newTheme, spacing),
    [newTheme, spacing]
  );

  return (
    <View style={styles.wrap}>
      <Slider
        style={styles.slider}
        minimumValue={HEIGHT_MIN_CM}
        maximumValue={HEIGHT_MAX_CM}
        step={1}
        value={value}
        minimumTrackTintColor={newTheme.accent}
        maximumTrackTintColor={newTheme.divider}
        thumbTintColor={newTheme.accent}
        onValueChange={(next) => onChange(Math.round(next))}
      />
    </View>
  );
};

const styling = (theme: ColorSet, spacing: Spacing) =>
  StyleSheet.create({
    wrap: {
      width: "100%",
      paddingTop: spacing.sm,
    },
    slider: {
      width: "100%",
      height: 32,
    },
  });
