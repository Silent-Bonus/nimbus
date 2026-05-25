import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polygon } from "react-native-svg";

import type { SvaColorSet } from "@/theme/types";
import type { RadarAxisPoint } from "./overviewTypes";

type RadarChartProps = {
  data: RadarAxisPoint[];
  size?: number;
  maxValue?: number;
  colors: SvaColorSet;
};

type RadarChartStyles = ReturnType<typeof createStyles>;

type Point = { x: number; y: number };

const GRID_LEVELS = 4;

function polarToCartesian(
  center: number,
  radius: number,
  angle: number
): Point {
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function pointString(points: Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export default function RadarChart({
  data,
  size = 220,
  maxValue = 100,
  colors,
}: RadarChartProps) {
  const styles: RadarChartStyles = useMemo(() => createStyles(colors), [colors]);

  const radius = size * 0.34;
  const center = size / 2;
  const angleStep = (Math.PI * 2) / Math.max(data.length, 3);
  const startAngle = -Math.PI / 2;

  const axisPoints = useMemo(
    () =>
      data.map((item, index) =>
        polarToCartesian(
          center,
          radius,
          startAngle + angleStep * index
        )
      ),
    [angleStep, center, data, radius, startAngle]
  );

  const polygonPoints = useMemo(() => {
    return Array.from({ length: GRID_LEVELS }, (_, levelIndex) => {
      const levelRatio = (levelIndex + 1) / GRID_LEVELS;
      const points = data.map((_, index) =>
        polarToCartesian(
          center,
          radius * levelRatio,
          startAngle + angleStep * index
        )
      );
      return pointString(points);
    });
  }, [angleStep, center, data, radius, startAngle]);

  const valuePoints = useMemo(() => {
    const points = data.map((item, index) => {
      const safeValue = Math.max(0, Math.min(item.value, maxValue));
      const valueRadius = (safeValue / maxValue) * radius;
      return polarToCartesian(
        center,
        valueRadius,
        startAngle + angleStep * index
      );
    });

    return pointString(points);
  }, [angleStep, center, data, maxValue, radius, startAngle]);

  const labelRadius = radius + 26;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {polygonPoints.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            points={points}
            fill="none"
            stroke={colors.border.muted}
            strokeWidth={1}
            opacity={0.65}
          />
        ))}

        {data.map((_, index) => {
          const end = polarToCartesian(
            center,
            radius,
            startAngle + angleStep * index
          );

          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke={colors.border.muted}
              strokeWidth={1}
              opacity={0.75}
            />
          );
        })}

        <Polygon
          points={valuePoints}
          fill={colors.brand.subtle}
          stroke={colors.brand.primary}
          strokeWidth={2}
        />

        {axisPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={data[index]?.color ?? colors.brand.primary}
            stroke={colors.bg.base}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {data.map((item, index) => {
          const labelPoint = polarToCartesian(
            center,
            labelRadius,
            startAngle + angleStep * index
          );
          const isLeft = labelPoint.x < center - 12;
          const isRight = labelPoint.x > center + 12;
          const isTop = labelPoint.y < center - 12;

          return (
            <View
              key={`${item.label}-${index}`}
              style={[
                styles.labelWrap,
                {
                  left: labelPoint.x,
                  top: labelPoint.y,
                  transform: [
                    { translateX: isLeft ? -76 : isRight ? -8 : -40 },
                    { translateY: isTop ? -6 : -14 },
                  ],
                },
              ]}
            >
              <Text style={styles.labelText} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.valueText}>
                {Math.round((item.value / maxValue) * 100)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: SvaColorSet) {
  return StyleSheet.create({
    wrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    labelWrap: {
      position: "absolute",
      width: 80,
      alignItems: "center",
    },
    labelText: {
      color: colors.text.primary,
      fontSize: 10.5,
      lineHeight: 12,
      letterSpacing: 1,
      textTransform: "uppercase",
      textAlign: "center",
      fontWeight: "700",
    },
    valueText: {
      marginTop: 2,
      color: colors.text.secondary,
      fontSize: 9.5,
      lineHeight: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      textAlign: "center",
    },
  });
}
