import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import ThemeContext from "@/contexts/ThemeContext";

type ProcessingModalProps = {
  visible: boolean;
  centerMessage?: ReactNode;
  footerMessage?: ReactNode;
  title?: string;
  subtitle?: string;
  message?: ReactNode;
  onRequestClose?: () => void;
};

const isTextLike = (value: ReactNode): value is string | number =>
  typeof value === "string" || typeof value === "number";

const renderMessage = (
  content: ReactNode,
  textStyle: any,
  defaultNode?: ReactNode
) => {
  const resolvedContent = content ?? defaultNode;

  if (resolvedContent === null || resolvedContent === undefined) {
    return null;
  }

  if (isTextLike(resolvedContent)) {
    return <Text style={textStyle}>{resolvedContent}</Text>;
  }

  return resolvedContent;
};

export default function ProcessingModal({
  visible,
  centerMessage,
  footerMessage,
  title = "Processing",
  subtitle = "Please wait while we finish your request.",
  message = "We're sending this to the backend and preparing the next screen.",
  onRequestClose = () => {},
}: ProcessingModalProps) {
  const { newTheme, spacing, svaColors, svaTypography, typography } =
    useContext(ThemeContext);

  const bodyTextStyle = svaTypography?.textStyle?.body ?? typography.body;
  const accentColor = svaColors?.brand?.primary ?? newTheme.accent ?? "#B8D39B";

  const styles = useMemo(
    () =>
      makeStyles(
        newTheme,
        spacing,
        bodyTextStyle,
        svaTypography,
        accentColor
      ),
    [accentColor, bodyTextStyle, newTheme, spacing, svaTypography]
  );

  const floatX = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const ringOne = useRef(new Animated.Value(0)).current;
  const ringTwo = useRef(new Animated.Value(0)).current;
  const ringThree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      [floatX, floatY, breathe, ringOne, ringTwo, ringThree].forEach(
        (value) => {
          value.stopAnimation();
          value.setValue(0);
        }
      );
      return;
    }

    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatX, {
            toValue: 1,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatX, {
            toValue: 0,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, {
            toValue: 1,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 0,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(0),
          Animated.timing(ringOne, {
            toValue: 1,
            duration: 1900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringOne, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(280),
          Animated.timing(ringTwo, {
            toValue: 1,
            duration: 1900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringTwo, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(560),
          Animated.timing(ringThree, {
            toValue: 1,
            duration: 1900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringThree, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ];

    loops.forEach((animation) => animation.start());

    return () => {
      loops.forEach((animation) => animation.stop());
    };
  }, [breathe, floatX, floatY, ringOne, ringThree, ringTwo, visible]);

  const floatXTranslate = floatX.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 14, 0],
  });
  const floatYTranslate = floatY.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -12, 0],
  });
  const floatScale = breathe.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.05, 0.96],
  });
  const floatRotate = breathe.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-4deg", "4deg", "-4deg"],
  });
  const haloScale = breathe.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.94, 1.06, 0.94],
  });
  const haloOpacity = breathe.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.22, 0.38, 0.22],
  });

  const ringOneScale = ringOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.45],
  });
  const ringOneOpacity = ringOne.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0.42, 0.2, 0],
  });
  const ringTwoScale = ringTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.5],
  });
  const ringTwoOpacity = ringTwo.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0.36, 0.16, 0],
  });
  const ringThreeScale = ringThree.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.55],
  });
  const ringThreeOpacity = ringThree.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0.28, 0.12, 0],
  });

  const resolvedCenterMessage =
    centerMessage ??
    (title || subtitle ? [title, subtitle].filter(Boolean).join("\n") : null);
  const resolvedFooterMessage =
    footerMessage ?? message ?? "Please wait while we finish your request.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <LinearGradient
          pointerEvents="none"
          colors={[accentColor, "transparent"]}
          style={styles.topGlow}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[accentColor, "transparent"]}
          style={styles.bottomGlow}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.orbitalField}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.halo,
                  {
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[accentColor, "transparent"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ring,
                  {
                    opacity: ringOneOpacity,
                    transform: [{ scale: ringOneScale }],
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ring,
                  {
                    opacity: ringTwoOpacity,
                    transform: [{ scale: ringTwoScale }],
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ring,
                  {
                    opacity: ringThreeOpacity,
                    transform: [{ scale: ringThreeScale }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.blobMotion,
                  {
                    transform: [
                      { translateX: floatXTranslate },
                      { translateY: floatYTranslate },
                      { scale: floatScale },
                      { rotate: floatRotate },
                    ],
                  },
                ]}
              >
                <View style={styles.blobShell}>
                  <Svg width="100%" height="100%" viewBox="0 0 240 240">
                    <Defs>
                      <RadialGradient
                        id="blobBase"
                        cx="35%"
                        cy="28%"
                        rx="80%"
                        ry="80%"
                        fx="30%"
                        fy="20%"
                      >
                        <Stop
                          offset="0%"
                          stopColor="#FFFFFF"
                          stopOpacity="0.88"
                        />
                        <Stop
                          offset="24%"
                          stopColor={accentColor}
                          stopOpacity="1"
                        />
                        <Stop
                          offset="58%"
                          stopColor={accentColor}
                          stopOpacity="0.72"
                        />
                        <Stop
                          offset="100%"
                          stopColor={accentColor}
                          stopOpacity="0.12"
                        />
                      </RadialGradient>
                      <RadialGradient
                        id="blobGlow"
                        cx="50%"
                        cy="40%"
                        rx="70%"
                        ry="70%"
                      >
                        <Stop
                          offset="0%"
                          stopColor={accentColor}
                          stopOpacity="0.58"
                        />
                        <Stop
                          offset="65%"
                          stopColor={accentColor}
                          stopOpacity="0.2"
                        />
                        <Stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                      </RadialGradient>
                    </Defs>

                    <Circle cx="120" cy="122" r="86" fill="url(#blobGlow)" />
                    <Path
                      d="M120 22C145 16 167 28 181 46C194 64 208 82 204 107C200 132 192 154 177 171C161 188 141 198 120 199C97 200 75 195 57 182C38 168 21 150 18 126C14 102 23 78 36 60C49 42 66 26 88 21C101 18 110 25 120 22Z"
                      fill="url(#blobBase)"
                    />
                    <Path
                      d="M121 35C141 30 159 38 170 53C181 68 190 82 187 103C184 124 179 142 167 155C154 170 137 180 120 180C101 181 83 177 68 167C52 156 38 142 35 121C31 99 37 79 48 63C58 47 72 36 90 33C103 31 111 38 121 35Z"
                      fill="#FFFFFF"
                      fillOpacity="0.12"
                    />
                    <Circle cx="84" cy="76" r="16" fill="#FFFFFF" fillOpacity="0.28" />
                    <Circle cx="160" cy="82" r="10" fill="#FFFFFF" fillOpacity="0.16" />
                    <Circle cx="150" cy="161" r="14" fill="#FFFFFF" fillOpacity="0.14" />
                    <Circle cx="74" cy="154" r="8" fill="#FFFFFF" fillOpacity="0.12" />
                  </Svg>
                </View>
              </Animated.View>
            </View>

            {resolvedCenterMessage ? (
              <View style={styles.centerCopy}>
                {renderMessage(
                  resolvedCenterMessage,
                  styles.centerMessage,
                  null
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.footerWrap}>
            <View style={styles.footerShell}>
              {renderMessage(resolvedFooterMessage, styles.footerMessage)}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const makeStyles = (
  t: any,
  spacing: any,
  bodyTextStyle: any,
  svaTypography: any,
  accentColor: string
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.background ?? t.backgroundPrimary ?? "#0B0F0D",
    },
    topGlow: {
      position: "absolute",
      top: -130,
      left: -90,
      width: 260,
      height: 260,
      borderRadius: 999,
      opacity: 0.28,
    },
    bottomGlow: {
      position: "absolute",
      bottom: -120,
      right: -100,
      width: 280,
      height: 280,
      borderRadius: 999,
      opacity: 0.22,
    },
    safeArea: {
      flex: 1,
      justifyContent: "space-between",
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    orbitalField: {
      width: "100%",
      maxWidth: 420,
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    halo: {
      position: "absolute",
      width: 290,
      height: 290,
      borderRadius: 999,
      overflow: "hidden",
      shadowColor: accentColor,
      shadowOpacity: 0.28,
      shadowRadius: 36,
      shadowOffset: { width: 0, height: 18 },
      elevation: 10,
    },
    ring: {
      position: "absolute",
      width: 254,
      height: 254,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.13)",
    },
    blobMotion: {
      width: 240,
      height: 240,
      alignItems: "center",
      justifyContent: "center",
    },
    blobShell: {
      width: 194,
      height: 194,
      borderRadius: 97,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.045)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.34,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 24,
      elevation: 12,
    },
    centerCopy: {
      marginTop: spacing.xl,
      maxWidth: 330,
      alignItems: "center",
    },
    centerMessage: {
      ...(svaTypography?.textStyle?.displayMedium ?? {}),
      color: t.textPrimary,
      fontSize: 30,
      lineHeight: 35,
      letterSpacing: -0.6,
      textAlign: "center",
      fontStyle: "normal",
      textShadowColor: "rgba(0,0,0,0.35)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    footerWrap: {
      paddingHorizontal: spacing.xl,
      paddingBottom:
        spacing.xl + (Platform.OS === "ios" ? spacing.sm : spacing.md),
      alignItems: "center",
    },
    footerShell: {
      width: "100%",
      maxWidth: 390,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    footerMessage: {
      ...bodyTextStyle,
      color: t.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      fontWeight: "600",
      letterSpacing: 0.15,
    },
  });
