import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Animated,
  Platform,
  UIManager,
  Easing,
  LayoutAnimation,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
// import { getCheckinList } from "@/services/dailyCheckinService";getCheckinList;
// import {
//   clamp,
//   pickColor,
//   pickIcon,
//   resolveUnit,
//   roundForUnit,
//   routeFor,
//   stepFor,
// } from "@/utils/dailyCheckin";
import axios from "axios";
// import { Unit } from "@/types/dailyCheckin";
import RitualStreakCard from "./RitualStreakCard";
import { RitualSkeletonCard } from "./RitualSkeletonCard";
import { getCheckinList } from "@/features/check-in/services/dailyCheckinService";
import { Unit } from "@/features/check-in/types/dailyCheckin";
import {
  clamp,
  pickColor,
  pickIcon,
  resolveUnit,
  roundForUnit,
  routeFor,
  stepFor,
} from "@/features/check-in/utils/dailyCheckin";

type CardItem = {
  name: string;
  goalQuantity: number;
  completedQuantity: number;
  unit: string;
  icon: string;
  color: string;
  route: string;
  id?: number;
};

type Props = { date: string };

const RitualStreakPanel = ({ date }: Props) => {
  const router = useRouter();
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const [items, setItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Animation for loading/transitions
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getCheckinList(date, true);
        const habits = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
          ? res
          : [];

        const mapped: CardItem[] = habits.map((h: any) => ({
          id: h.id,
          name: h.name ?? "Habit",
          goalQuantity: Number(h.target_unit ?? 0),
          completedQuantity: Number(h.completed_unit ?? 0),
          unit: resolveUnit(h),
          icon: pickIcon(h.name),
          color: h.color || pickColor(h.name, newTheme),
          route: routeFor(h.name),
        }));

        setItems(mapped);
      } catch (e: any) {
        const msg = axios.isAxiosError(e)
          ? e.response?.data?.message ??
            e.response?.data?.detail ??
            e.message ??
            "Failed to load"
          : (typeof e === "string" ? e : e?.message) || "Failed to load";
        setErr(msg);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date, newTheme]);

  const incrementByName = (name: string) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.name !== name) return p;
        const step = stepFor(p);
        const next = clamp(p.completedQuantity + step, 0, p.goalQuantity);
        return { ...p, completedQuantity: roundForUnit(next, p.unit as Unit) };
      })
    );

  const decrementByName = (name: string) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.name !== name) return p;
        const step = stepFor(p);
        const next = clamp(p.completedQuantity - step, 0, p.goalQuantity);
        return { ...p, completedQuantity: roundForUnit(next, p.unit as Unit) };
      })
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>RITUAL STREAKS</Text>
          {/* <Text style={styles.sectionSubtitle}>PHASE 2 ACTIVE</Text> */}
        </View>
        <View style={styles.headerRight}>
          <Ionicons
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={18}
            color={newTheme.accent}
          />
        </View>
      </TouchableOpacity>

      {/* Horizontal Scroll */}
      {!isCollapsed && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            [0, 1, 2].map((i) => (
              <RitualSkeletonCard key={`sk-${i}`} theme={newTheme} />
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <RitualStreakCard
                key={item.id ?? item.name}
                {...item}
                onPress={() =>
                  router.push({
                    pathname: item.route as any,
                    params: {
                      id: item.id?.toString(),
                      date: date,
                    },
                  })
                }
                onIncrement={() => incrementByName(item.name)}
                onDecrement={() => decrementByName(item.name)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No rituals set for today.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      paddingHorizontal: 4,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      paddingLeft: spacing.sm,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: theme.accent, // Use accent color for "RITUAL STREAKS"
      opacity: 0.9,
    },
    sectionSubtitle: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.8,
      color: theme.textSecondary,
      opacity: 0.5,
    },
    scrollContent: {
      paddingRight: spacing.lg,
    },
    emptyCard: {
      width: 200,
      height: 120,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.borderMuted,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
  });

export default RitualStreakPanel;
