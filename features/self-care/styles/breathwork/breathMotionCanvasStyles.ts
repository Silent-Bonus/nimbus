import { StyleSheet } from "react-native";

import type { Typography } from "@/theme/types";

export const BOX_FRAME_RADIUS = 28;

export const makeBreathMotionCanvasStyles = (typography: Typography) =>
  StyleSheet.create({
    motionStage: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      position: "relative",
    },
    squareFrame: {
      borderWidth: 1,
      borderRadius: BOX_FRAME_RADIUS,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    squareGlow: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
    },
    edgeLabel: {
      position: "absolute",
      ...typography.smallCaption,
      textTransform: "uppercase",
      letterSpacing: 1.8,
      backgroundColor: "rgba(0,0,0,0.18)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      overflow: "hidden",
    },
    edgeTop: {
      top: 12,
      alignSelf: "center",
    },
    edgeBottom: {
      bottom: 12,
      alignSelf: "center",
    },
    edgeLeft: {
      left: 12,
      top: "50%",
      transform: [{ translateY: -10 }, { rotate: "-90deg" }],
    },
    edgeRight: {
      right: 12,
      top: "50%",
      transform: [{ translateY: -10 }, { rotate: "90deg" }],
    },
    breathOrb: {
      position: "absolute",
      shadowOpacity: 0.32,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    breathOrbTrack: {
      position: "absolute",
      top: 0,
      left: 0,
    },
    orbFrame: {
      borderWidth: 1,
      borderRadius: 999,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    orbGlow: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
    },
    orbCore: {
      position: "absolute",
      shadowOpacity: 0.28,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 5,
    },
    orbLabel: {
      ...typography.smallCaption,
      position: "absolute",
      bottom: 18,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
  });
