import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type View as NativeView,
} from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

type WalkthroughStep = {
  title: string;
  body: string;
  targetRef: React.RefObject<NativeView | null>;
};

type HomeWalkthroughOverlayProps = {
  visible: boolean;
  stepIndex: number;
  steps: WalkthroughStep[];
  onNext: () => void;
  onSkip: () => void;
};

type TargetRect = { x: number; y: number; width: number; height: number };

const TOOLTIP_HEIGHT = 190;
const TARGET_PADDING = 8;

export default function HomeWalkthroughOverlay({
  visible,
  stepIndex,
  steps,
  onNext,
  onSkip,
}: HomeWalkthroughOverlayProps) {
  const { width, height } = useWindowDimensions();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!visible || !step) {
      setTargetRect(null);
      return;
    }

    setTargetRect(null);
    let frame = 0;
    let active = true;
    frame = requestAnimationFrame(() => {
      step.targetRef.current?.measureInWindow((x, y, targetWidth, targetHeight) => {
        if (active) {
          setTargetRect({ x, y, width: targetWidth, height: targetHeight });
        }
      });
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [step, visible]);

  if (!step) return null;

  const focus = targetRect
    ? {
        x: Math.max(4, targetRect.x - TARGET_PADDING),
        y: Math.max(4, targetRect.y - TARGET_PADDING),
        width: Math.min(width - 8, targetRect.width + TARGET_PADDING * 2),
        height: targetRect.height + TARGET_PADDING * 2,
      }
    : null;
  const bubbleWidth = Math.min(340, width - 32);
  const bubbleLeft = Math.max(
    16,
    Math.min(
      targetRect
        ? targetRect.x + targetRect.width / 2 - bubbleWidth / 2
        : (width - bubbleWidth) / 2,
      width - bubbleWidth - 16
    )
  );
  const hasRoomBelow = targetRect
    ? targetRect.y + targetRect.height + TOOLTIP_HEIGHT + 28 < height
    : false;
  const bubbleTop = targetRect
    ? hasRoomBelow
      ? targetRect.y + targetRect.height + 22
      : Math.max(16, targetRect.y - TOOLTIP_HEIGHT - 22)
    : Math.max(16, height / 2 - TOOLTIP_HEIGHT / 2);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <Mask id="walkthrough-mask">
              <Rect x="0" y="0" width={width} height={height} fill="white" />
              {focus ? (
                <Rect
                  x={focus.x}
                  y={focus.y}
                  width={focus.width}
                  height={focus.height}
                  rx="20"
                  fill="black"
                />
              ) : null}
            </Mask>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="rgba(8,10,8,0.76)"
            mask="url(#walkthrough-mask)"
          />
          {focus ? (
            <Rect
              x={focus.x}
              y={focus.y}
              width={focus.width}
              height={focus.height}
              rx="20"
              fill="transparent"
              stroke="#A3BE8C"
              strokeWidth="2"
            />
          ) : null}
        </Svg>

        <View
          accessibilityViewIsModal
          style={[styles.tooltip, { left: bubbleLeft, top: bubbleTop, width: bubbleWidth }]}
        >
          <View style={styles.tooltipTopRow}>
            <Text style={styles.progressLabel}>YOUR FIRST LOOK</Text>
            <Text style={styles.progressCount}>
              {stepIndex + 1}/{steps.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close walkthrough"
              onPress={onSkip}
              hitSlop={10}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onSkip}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onNext}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
              ]}
            >
              <Text style={styles.nextText}>{isLastStep ? "Start exploring" : "Next"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tooltip: {
    position: "absolute",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#F5F4EF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 14,
  },
  tooltipTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    color: "#68705E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    flex: 1,
  },
  progressCount: {
    color: "#68705E",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 12,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(20,24,18,0.07)",
  },
  closeText: {
    color: "#30352B",
    fontSize: 20,
    lineHeight: 22,
  },
  title: {
    color: "#171A15",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },
  body: {
    color: "#565D50",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  skipText: {
    color: "#68705E",
    fontSize: 12,
    fontWeight: "700",
  },
  nextButton: {
    minHeight: 38,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#1C1E1A",
  },
  nextButtonPressed: {
    opacity: 0.82,
  },
  nextText: {
    color: "#F4F5F1",
    fontSize: 12,
    fontWeight: "800",
  },
});
