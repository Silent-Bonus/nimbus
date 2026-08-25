import React, { useMemo } from "react";
import { Animated, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  BOX_FRAME_RADIUS,
  makeBreathMotionCanvasStyles,
} from "@/features/self-care/styles/breathwork/breathMotionCanvasStyles";
import type {
  BreathMotionVariant,
  BreathPhase,
} from "@/features/self-care/types/wellnessContentTypes";
import { resolveBreathworkColor } from "@/features/self-care/utils/breathworkUtils";
import type { Typography } from "@/theme/types";

type BreathMotionCanvasProps = {
  motionVariant: BreathMotionVariant;
  phases: BreathPhase[];
  currentPhase: BreathPhase;
  phaseIndex: number;
  phaseProgress: Animated.Value;
  motionSize: number;
  accent: string;
  motionFrameBorder: string;
  shadow: string;
  typography: Typography;
  textSecondary: string;
  surface: string;
  motionCoreStart: string;
  motionCoreEnd: string;
  motionGlow: string;
};

const getPulseScaleRange = (
  phaseLabel: string,
  motionVariant: BreathMotionVariant
): number[] => {
  const normalized = phaseLabel.trim().toLowerCase();
  const isOrb = motionVariant === "orb";

  if (normalized.includes("inhale")) {
    return isOrb ? [0.88, 1.14] : [0.94, 1.08];
  }

  if (normalized.includes("exhale")) {
    return isOrb ? [1.14, 0.88] : [1.08, 0.94];
  }

  if (normalized.includes("hold")) {
    return isOrb ? [0.98, 1.02] : [1, 1];
  }

  return isOrb ? [0.98, 1.02] : [1, 1];
};

const BreathMotionCanvas = ({
  motionVariant,
  phases,
  currentPhase,
  phaseIndex,
  phaseProgress,
  motionSize,
  accent,
  motionFrameBorder,
  shadow,
  typography,
  textSecondary,
  surface,
  motionCoreStart,
  motionCoreEnd,
  motionGlow,
}: BreathMotionCanvasProps) => {
  const s = useMemo(() => makeBreathMotionCanvasStyles(typography), [typography]);
  const frameSize = Math.max(220, motionSize - 40);
  const ballSize = 26;
  const cornerInset = Math.max(0, BOX_FRAME_RADIUS - ballSize / 2);

  if (motionVariant === "box") {
    const positions = [
      {
        startX: 0,
        startY: frameSize - ballSize - cornerInset,
        endX: 0,
        endY: cornerInset,
      },
      {
        startX: cornerInset,
        startY: 0,
        endX: frameSize - ballSize - cornerInset,
        endY: 0,
      },
      {
        startX: frameSize - ballSize,
        startY: cornerInset,
        endX: frameSize - ballSize,
        endY: frameSize - ballSize - cornerInset,
      },
      {
        startX: frameSize - ballSize - cornerInset,
        startY: frameSize - ballSize,
        endX: cornerInset,
        endY: frameSize - ballSize,
      },
    ];

    const segments = phases.slice(0, 4).map((phase, index) => ({
      ...positions[index],
      phase,
    }));

    const segment = segments[phaseIndex] ?? segments[0] ?? {
      startX: 0,
      startY: frameSize - ballSize - cornerInset,
      endX: 0,
      endY: cornerInset,
    };
    const scale = phaseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: getPulseScaleRange(currentPhase.label, motionVariant),
    });
    const translateX = phaseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [segment.startX, segment.endX],
    });
    const translateY = phaseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [segment.startY, segment.endY],
    });

    const edgePositions = ["left", "top", "right", "bottom"] as const;
    const edges = phases.slice(0, 4).map((phase, index) => ({
      label: phase.label,
      position: edgePositions[index],
      active: phaseIndex === index,
      color: phase.color,
    }));

    return (
      <View
        style={[
          s.motionStage,
          {
            width: motionSize,
            minHeight: motionSize + 8,
            alignSelf: "center",
          },
        ]}
      >
        <View
          style={[
            s.squareFrame,
            {
              width: frameSize,
              height: frameSize,
              backgroundColor: surface,
              borderColor: motionFrameBorder,
              shadowColor: shadow,
            },
          ]}
        >
          <View
            style={[
              s.squareGlow,
              {
                backgroundColor: motionGlow,
              },
            ]}
          />

          {edges.map((edge) => (
            <Text
              key={`${edge.position}-${edge.label}`}
              style={[
                s.edgeLabel,
                edge.position === "top" && s.edgeTop,
                edge.position === "right" && s.edgeRight,
                edge.position === "bottom" && s.edgeBottom,
                edge.position === "left" && s.edgeLeft,
                {
                  color: edge.active
                    ? resolveBreathworkColor(edge.color, accent)
                    : textSecondary,
                  opacity: edge.active ? 1 : 0.72,
                },
              ]}
            >
              {edge.label}
            </Text>
          ))}

          <Animated.View
            style={[
              s.breathOrbTrack,
              {
                width: ballSize,
                height: ballSize,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          >
            <Animated.View
              style={[
                s.breathOrb,
                {
                  width: ballSize,
                  height: ballSize,
                  borderRadius: ballSize / 2,
                  shadowColor: shadow,
                  transform: [{ scale }],
                },
              ]}
            >
              <LinearGradient
                colors={[motionCoreStart, motionCoreEnd]}
                start={{ x: 0.15, y: 0.15 }}
                end={{ x: 0.85, y: 0.85 }}
                style={{
                  flex: 1,
                  borderRadius: ballSize / 2,
                }}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </View>
    );
  }

  const orbSize = frameSize * 0.54;
  const label = currentPhase.label.trim().toLowerCase();
  const translateY = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange:
      label.includes("inhale")
        ? [10, -8]
        : label.includes("exhale")
          ? [-8, 10]
          : [0, 0],
  });
  const scale = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: getPulseScaleRange(currentPhase.label, motionVariant),
  });

  return (
    <View
      style={[
        s.motionStage,
        {
          width: motionSize,
          minHeight: motionSize + 8,
          alignSelf: "center",
        },
      ]}
    >
      <View
        style={[
          s.orbFrame,
          {
            width: frameSize,
            height: frameSize,
            backgroundColor: surface,
            borderColor: accent,
            shadowColor: shadow,
          },
        ]}
      >
        <View
          style={[
            s.orbGlow,
            {
              backgroundColor: motionGlow,
            },
          ]}
        />

        <Animated.View
          style={[
            s.orbCore,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              shadowColor: shadow,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <LinearGradient
            colors={[motionCoreStart, motionCoreEnd]}
            start={{ x: 0.15, y: 0.15 }}
            end={{ x: 0.85, y: 0.85 }}
            style={{
              flex: 1,
              borderRadius: orbSize / 2,
            }}
          />
        </Animated.View>

        <Text style={[s.orbLabel, { color: textSecondary }]}>
          {currentPhase.label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

export default BreathMotionCanvas;
