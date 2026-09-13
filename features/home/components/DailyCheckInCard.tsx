// DailyCheckInCard.tsx
import ThemeContext from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Pressable,
  Platform,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

interface DailyCheckInCardProps {
  name: string;
  goalQuantity: number;
  completedQuantity: number;
  unit: string;
  icon: string; // emoji for now
  color: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  /** navigation: either pass onPress OR route (expo-router path) */
  onPress?: () => void;
  route?: string; // e.g. "/Tools/WaterLog"
  params?: Record<string, any>;
  style?: any;
  accessibleLabel?: string;
}

const RADIUS = 40;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DailyCheckInCard: React.FC<DailyCheckInCardProps> = ({
  name,
  goalQuantity,
  completedQuantity,
  unit,
  icon,
  color,
  route,
  params,
  style,
  accessibleLabel,
  onIncrement,
  onDecrement,
  onPress,
}) => {
  const progress = Math.min(completedQuantity / goalQuantity, 1);
  const strokeDashoffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

  const { newTheme } = useContext(ThemeContext);
  const styles = styling(newTheme);

  const router = useRouter();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
      return;

      // router.push("/(auth)/check-in/water")
    }
    if (route) {
      // prefer route navigation if given
      // router.push({ pathname: route, params: params ?? {} });
      // prefer route navigation if given
    }
    // otherwise nothing
  };

  // prevent card press when tapping small controls:
  const stopPropagation = (e?: GestureResponderEvent) => {
    e?.stopPropagation?.();
  };

  // console.log(name, "name");

  return (
    <Pressable
      onPress={handleCardPress}
      android_ripple={{ color: "rgba(255,255,255,0.04)" }}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && Platform.OS === "ios" ? { opacity: 0.88 } : undefined,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        accessibleLabel ??
        `${name} card. ${completedQuantity} of ${goalQuantity} ${unit}`
      }
    >
      {/* Header */}
      <View style={styles.header}>
        {/* <Text style={styles.icon}>{icon}</Text> */}
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Circle progress */}
      <View style={styles.circleWrapper}>
        <Svg width={100} height={100}>
          <Circle
            stroke={newTheme.borderMuted}
            fill="none"
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
          />
          <Circle
            stroke={color}
            fill="none"
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.quantity}>
            {completedQuantity}/{goalQuantity}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={onDecrement}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onIncrement}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styling = (newTheme: any) =>
  StyleSheet.create({
    card: {
      // backgroundColor: "red",
      backgroundColor: newTheme.card,
      borderRadius: 16,
      padding: 10,
      alignItems: "center",
      width: 160, // ✅ fixed width
      height: 220, // ✅ fixed height
      marginRight: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    icon: {
      fontSize: 18,
      marginRight: 6,
    },
    name: {
      color: newTheme.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    circleWrapper: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
    },
    centerText: {
      position: "absolute",
      alignItems: "center",
    },
    quantity: {
      color: newTheme.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    unit: {
      color: newTheme.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    controls: {
      flexDirection: "row",
      marginTop: 16,
    },
    btn: {
      backgroundColor: newTheme.cardRaised,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      marginHorizontal: 6,
    },
    btnText: {
      fontSize: 18,
      color: newTheme.buttonPrimary,
      fontWeight: "600",
    },
  });

export default DailyCheckInCard;
