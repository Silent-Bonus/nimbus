import ThemeContext from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

interface RitualStreakCardProps {
  name: string;
  goalQuantity: number;
  completedQuantity: number;
  unit: string;
  icon: string;
  color: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onPress?: () => void;
  route?: string;
  accessibleLabel?: string;
}

const RADIUS = 28;
const STROKE_WIDTH = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Helper to map emoji/string to Ionicon name
const getIconName = (icon: string): any => {
  switch (icon) {
    case "💧":
      return "water";
    case "😴":
      return "moon";
    case "🧘":
      return "leaf";
    case "📚":
      return "book";
    case "⭐️":
      return "star";
    default:
      return "flash";
  }
};

const RitualStreakCard: React.FC<RitualStreakCardProps> = ({
  name,
  goalQuantity,
  completedQuantity,
  unit,
  icon,
  color,
  onIncrement,
  onDecrement,
  onPress,
}) => {
  const { newTheme, spacing } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing);

  const progress = Math.min(completedQuantity / (goalQuantity || 1), 1);
  const strokeDashoffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

  // Derive a "status" label based on progress for the premium feel
  const getStatus = () => {
    if (progress >= 1) return { label: "Master", color: newTheme.accent };
    if (progress >= 0.5) return { label: "Elite", color: newTheme.info };
    return null; // Remove Stable text as requested
  };

  const status = getStatus();
  const iconName = getIconName(icon);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && Platform.OS === "ios" ? { opacity: 0.9 } : undefined,
      ]}
    >
      <View style={styles.cardContent}>
        {/* Progress Circle */}
        <View style={styles.circleContainer}>
          <Svg width={70} height={70}>
            <Circle
              stroke="rgba(255,255,255,0.06)"
              fill="none"
              cx="35"
              cy="35"
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            <Circle
              stroke={color}
              fill={color}
              fillOpacity={0.05 + progress * 0.15} // Dynamic fill based on progress
              cx="35"
              cy="35"
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="35, 35"
            />
          </Svg>

          {/* Inner Icon */}
          <View style={styles.innerCircle}>
            <Ionicons name={iconName} size={24} color={color} />
          </View>
        </View>

        {/* Text Details */}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {status ? (
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        ) : (
          <View style={{ height: 18 }} />
        )}
      </View>

      {/* Hidden/Subtle Touch Areas for Increment/Decrement overlay */}
      <View style={styles.controlOverlay}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onDecrement}
          hitSlop={10}
        />
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onIncrement}
          hitSlop={10}
        />
      </View>
    </Pressable>
  );
};

const styling = (theme: any, spacing: any) =>
  StyleSheet.create({
    card: {
      width: 110,
      height: 152,
      backgroundColor: theme.cardRaised ?? "#262A22",
      borderRadius: 22,
      marginRight: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",
      overflow: "hidden",
      padding: spacing.sm,
    },
    cardContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    circleContainer: {
      marginBottom: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    innerCircle: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
    },
    name: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: "500",
      letterSpacing: 0.3,
      marginBottom: 4,
      fontStyle: "italic", // As per screenshot labels (Jala, Nidra)
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      opacity: 0.8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    controlOverlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      display: "none",
    },
    controlBtn: {
      flex: 1,
    },
  });

export default RitualStreakCard;
