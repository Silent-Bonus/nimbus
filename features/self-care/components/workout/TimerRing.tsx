import React, { useContext, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, TypographyTokens } from "@/theme/types";

interface TimerRingProps {
  size: number;
  progress: number;
  remainingSeconds: number;
  statusText: string;
  mode: "workout" | "rest";
}

const TimerRing: React.FC<TimerRingProps> = ({
  size,
  progress,
  remainingSeconds,
  statusText,
  mode,
}) => {
  const { newTheme: theme, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(() => styling(theme, svaTypography), [theme, svaTypography]);

  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={theme.surfaceMuted}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={mode === "rest" ? theme.chart2 ?? "#7EF2A6" : theme.buttonPrimary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View style={styles.labelContainer}>
        <Text style={styles.timeText}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
};

const styling = (theme: ColorSet, svaTypography: any) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    labelContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    timeText: {
      ...svaTypography.textStyle.heading2,
      color: theme.textPrimary,
      fontSize: 34,
      lineHeight: 38,
      fontWeight: "600",
    },
    statusText: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      marginTop: 4,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
  });

export default TimerRing;
