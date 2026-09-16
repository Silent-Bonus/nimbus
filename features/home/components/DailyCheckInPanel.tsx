// components/homeScreen/DailyCheckInPanel.tsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  ActivityIndicator,
  Pressable,
} from "react-native";
import DailyCheckInCard from "@/features/home/components/DailyCheckInCard";
import ThemeContext from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { getCheckinList } from "@/features/check-in/services/dailyCheckinService";
import {
  clamp,
  pickColor,
  pickIcon,
  resolveUnit,
  roundForUnit,
  routeFor,
  stepFor,
} from "@/features/check-in/utils/dailyCheckin";
import { DailyCheckinSkeletonCard } from "./DailyCheckinSkeletonCard";
import axios from "axios";
import { Unit } from "@/features/check-in/types/dailyCheckin";
import ProgressPill from "./ProgressPill";

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

type Props = { date: string }; // YYYY-MM-DD

const DailyCheckInPanel = ({ date }: Props) => {
  const router = useRouter();
  const { newTheme } = useContext(ThemeContext);
  const styles = styling(newTheme);

  const [items, setItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const [expanded, setExpanded] = useState(true);
  const rotateAnim = React.useRef(new Animated.Value(1)).current;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    // rotate caret animation
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Layout animation for show/hide
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded, rotateAnim]);

  const loadData = useCallback(async (targetDate: string) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getCheckinList(targetDate, true); // single source of truth

      // Some backends return { success, data }, some return array directly
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
      // robust string extraction for axios or generic errors
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
  }, [newTheme]);

  useEffect(() => {
    loadData(date);
  }, [date, loadData]);

  // caret rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const completedCount = useMemo(
    () =>
      items.filter(
        (d) => d.completedQuantity >= d.goalQuantity && d.goalQuantity > 0
      ).length,
    [items]
  );

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
      {/* Header - tappable to toggle */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setExpanded((v) => !v);
        }}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.title}>Daily check-in</Text>

          {/* small space between title and caret */}
          <Animated.View
            style={[styles.caretContainer, { transform: [{ rotate }] }]}
          >
            <Text style={styles.caret}>⌄</Text>
          </Animated.View>
        </View>

        {/* Count pill always visible */}
        <ProgressPill label={`${completedCount}/${items.length || 0}`} />
      </TouchableOpacity>

      {/* Horizontal scroll list */}

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {loading ? (
              // skeletons
              [0, 1, 2, 3].map((i) => (
                <DailyCheckinSkeletonCard key={`sk-${i}`} theme={newTheme} />
              ))
            ) : err ? (
              // error card only
              <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{err}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      loadData(date);
                    }}
                    style={styles.retryBtn}
                  >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : items.length > 0 ? (
              // data cards
              items.map((item) => (
                <DailyCheckInCard
                  key={item.id ?? item.name}
                  {...item}
                  onPress={() =>
                    router.push({
                      pathname: item.route as any,
                      params: {
                        id: item.id?.toString(),
                        date: date, // <— same date
                      },
                    })
                  }
                  onIncrement={() => incrementByName(item.name)}
                  onDecrement={() => decrementByName(item.name)}
                />
              ))
            ) : (
              // empty state only
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No check-ins for today</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styling = (newTheme: any) =>
  StyleSheet.create({
    container: {
      paddingBottom: 10,
      backgroundColor: newTheme.background,
    },
    scrollContent: {
      paddingRight: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // backgroundColor: "red",
      marginBottom: 16,
    },
    title: { fontSize: 18, fontWeight: "600", color: "white" },
    pill: {
      backgroundColor: newTheme.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    pillText: { color: newTheme.textSecondary, fontWeight: "500" },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingBottom: 8,
    },

    // caret styles (simple text caret to avoid extra icon package)
    caretContainer: {
      marginLeft: 8,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    caret: {
      fontSize: 16,
      color: newTheme.textSecondary,
      // rotate is handled by Animated.View
    },
    errorCard: {
      width: 220,
      minHeight: 140,
      borderRadius: 16,
      marginRight: 12,
      padding: 12,
      backgroundColor: "#2a1f21",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.error,
      justifyContent: "space-between",
    },
    errorText: { color: newTheme.textPrimary, marginBottom: 8 },
    retryBtn: {
      alignSelf: "flex-start",
      backgroundColor: newTheme.accent,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    retryText: { color: "#10120E", fontWeight: "800" },

    emptyCard: {
      width: 220,
      height: 140,
      borderRadius: 16,
      marginRight: 12,
      backgroundColor: newTheme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: newTheme.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: { color: newTheme.textSecondary },
  });

export default DailyCheckInPanel;
