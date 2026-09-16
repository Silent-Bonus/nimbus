import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Circle, Line, Path, Svg } from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, Spacing, TypographyTokens } from "@/theme/types";
import {
  CLOCK_TICK_MINUTES,
  describeClockArc,
  durationBetween,
  minutesToAngle,
  minutesToClock,
  polarToCartesian,
  touchToMinutes,
} from "@/features/check-in/utils/sleepCheckin";

type CircadianAlignmentCardProps = {
  bedMinutes: number;
  wakeMinutes: number;
  onChangeBed: (value: number) => void;
  onChangeWake: (value: number) => void;
};

const makeStyles = (theme: ColorSet, spacing: Spacing, svaTypography: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 28,
      overflow: "hidden",
      padding: spacing.lg,
      backgroundColor: theme.cardRaised ?? theme.surface,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.06)",
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.24,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    sectionLabel: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "800",
      letterSpacing: 1.8,
      opacity: 0.88,
    },
    cardSubTitle: {
      ...svaTypography.textStyle.caption,
      marginTop: 4,
      color: theme.textSecondary,
      lineHeight: 16,
      opacity: 0.86,
    },
    clockWrap: {
      width: 246,
      height: 246,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 6,
      position: "relative",
      overflow: "visible",
    },
    clockInner: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 176,
      height: 176,
      borderRadius: 88,
      backgroundColor: "rgba(0,0,0,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    clockPrimary: {
      ...svaTypography.textStyle.heading1,
      color: theme.textPrimary,
      letterSpacing: -0.4,
    },
    clockSecondary: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginTop: 2,
    },
    clockMarker: {
      position: "absolute",
      width: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    clockMarkerText: {
      ...svaTypography.textStyle.authTinyLabel,
      color: theme.textSecondary,
      fontWeight: "700",
      textAlign: "center",
    },
    clockHandle: {
      position: "absolute",
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1,
      shadowColor: theme.shadow ?? "#000",
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 4,
      zIndex: 2,
    },
    clockRangeWrap: {
      alignItems: "center",
    marginTop: spacing.sm,
    },
    clockRangeText: {
      ...svaTypography.textStyle.body,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.1,
      textAlign: "center",
    },
  });

export const CircadianAlignmentCard = ({
  bedMinutes,
  wakeMinutes,
  onChangeBed,
  onChangeWake,
}: CircadianAlignmentCardProps) => {
  const { newTheme: theme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => makeStyles(theme, spacing, svaTypography),
    [theme, spacing, svaTypography]
  );

  const clockRef = useRef<View>(null);
  const clockBoundsRef = useRef({
    pageX: 0,
    pageY: 0,
    width: 246,
    height: 246,
  });

  const clockSize = 246;
  const strokeWidth = 16;
  const center = clockSize / 2;
  const radius = (clockSize - strokeWidth) / 2;
  const handleOrbitRadius = radius;

  // The ring represents a 24-hour clock. The filled arc is the sleep window,
  // while the moon and sun handles remain directly draggable by the user.
  const sleepWindowMinutes = durationBetween(bedMinutes, wakeMinutes);
  const sleepWindowHours = sleepWindowMinutes / 60;

  const bedPoint = polarToCartesian(
    center,
    center,
    handleOrbitRadius,
    minutesToAngle(bedMinutes)
  );
  const wakePoint = polarToCartesian(
    center,
    center,
    handleOrbitRadius,
    minutesToAngle(wakeMinutes)
  );
  const clockMarkerLabels = ["12 AM", "6 AM", "12 PM", "6 PM"];
  const sleepArcPath = describeClockArc(
    center,
    center,
    radius,
    minutesToAngle(bedMinutes),
    minutesToAngle(bedMinutes) +
      (Math.min(sleepWindowMinutes, 24 * 60) / (24 * 60)) * 360
  );

  const refreshClockBounds = useCallback(() => {
    clockRef.current?.measureInWindow((pageX, pageY, width, height) => {
      if (width > 0 && height > 0) {
        clockBoundsRef.current = { pageX, pageY, width, height };
      }
    });
  }, []);

  const setClockMinutesFromTouch = useCallback(
    (x: number, y: number, type: "bed" | "wake") => {
      // Convert the touch coordinate back to clock minutes using the measured
      // on-screen bounds so the interaction remains accurate in the modal.
      const next = touchToMinutes(x, y, clockBoundsRef.current);
      if (type === "bed") {
        onChangeBed(next);
      } else {
        onChangeWake(next);
      }
    },
    [onChangeBed, onChangeWake]
  );

  const bedResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          refreshClockBounds();
        },
        onPanResponderMove: (_, gestureState) => {
          setClockMinutesFromTouch(gestureState.moveX, gestureState.moveY, "bed");
        },
        onPanResponderRelease: () => {
          refreshClockBounds();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [refreshClockBounds, setClockMinutesFromTouch]
  );

  const wakeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          refreshClockBounds();
        },
        onPanResponderMove: (_, gestureState) => {
          setClockMinutesFromTouch(gestureState.moveX, gestureState.moveY, "wake");
        },
        onPanResponderRelease: () => {
          refreshClockBounds();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [refreshClockBounds, setClockMinutesFromTouch]
  );

  const accent = theme.chart2 ?? theme.accent;
  const wakeAccent = theme.chart1 ?? theme.accent;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>CIRCADIAN ALIGNMENT</Text>
          <Text style={styles.cardSubTitle}>
            Drag the moon and sun to tune your night.
          </Text>
        </View>
      </View>

      <View
        ref={clockRef}
        onLayout={refreshClockBounds}
        style={styles.clockWrap}
      >
        <Svg
          pointerEvents="none"
          width={clockSize}
          height={clockSize}
          viewBox={`0 0 ${clockSize} ${clockSize}`}
        >
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.borderMuted ?? "rgba(255,255,255,0.08)"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {CLOCK_TICK_MINUTES.map((tickMinute) => {
            const angle = minutesToAngle(tickMinute);
            const outer = polarToCartesian(center, center, radius + 2, angle);
            const inner = polarToCartesian(center, center, radius - 10, angle);
            return (
              <Line
                key={tickMinute}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={theme.textSecondary ?? "rgba(255,255,255,0.35)"}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.4}
              />
            );
          })}
          <Path
            d={sleepArcPath}
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {/* Fixed time markers make the clock orientation clear at a glance. */}
        {CLOCK_TICK_MINUTES.map((tickMinute, index) => {
          const markerPoint = polarToCartesian(
            center,
            center,
            radius - 28,
            minutesToAngle(tickMinute)
          );

          return (
            <View
              key={tickMinute}
              pointerEvents="none"
              style={[
                styles.clockMarker,
                {
                  left: markerPoint.x - 24,
                  top: markerPoint.y - 9,
                },
              ]}
            >
              <Text style={styles.clockMarkerText}>
                {clockMarkerLabels[index]}
              </Text>
            </View>
          );
        })}

        <View pointerEvents="none" style={styles.clockInner}>
          <Text style={styles.clockPrimary}>{sleepWindowHours.toFixed(1)}h</Text>
          <Text style={styles.clockSecondary}>sleep window</Text>
        </View>

        <View
          style={[
            styles.clockHandle,
            {
              left: bedPoint.x - 22,
              top: bedPoint.y - 22,
              borderColor: accent,
            },
          ]}
          {...bedResponder.panHandlers}
        >
          <Ionicons name="moon-outline" size={14} color={accent} />
        </View>
        <View
          style={[
            styles.clockHandle,
            {
              left: wakePoint.x - 22,
              top: wakePoint.y - 22,
              borderColor: wakeAccent,
            },
          ]}
          {...wakeResponder.panHandlers}
        >
          <Ionicons name="sunny-outline" size={14} color={wakeAccent} />
        </View>
      </View>

      <View style={styles.clockRangeWrap}>
        <Text style={styles.clockRangeText}>
          {minutesToClock(bedMinutes)} → {minutesToClock(wakeMinutes)}
        </Text>
      </View>
    </View>
  );
};
