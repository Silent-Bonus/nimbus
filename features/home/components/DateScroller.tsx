// components/homeScreen/DateScroller.tsx
import React, { useContext, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { addDays, isSameDay, startOfDay, subDays } from "date-fns";
import ThemeContext from "@/contexts/ThemeContext";
import type { ColorSet, TypographyTokens } from "@/theme/types";

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  isLoading?: boolean;
  daysAroundToday?: number;
};

const DEFAULT_DAYS_AROUND = 365;
const atMidnight = (d: Date) => startOfDay(d);

export default function DateScroller({
  value,
  onChange,
  isLoading = false,
  daysAroundToday = DEFAULT_DAYS_AROUND,
}: Props) {
  const listRef = useRef<FlatList<Date>>(null);
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = useMemo(
    () => Math.max(56, Math.min(72, screenWidth / 6.2)),
    [screenWidth]
  );
  const sidePad = Math.max(12, (screenWidth - itemWidth) / 2);

  const { newTheme: theme, svaTypography } = useContext(ThemeContext);
  const styles = useMemo(
    () => styling(theme, svaTypography, itemWidth, sidePad),
    [theme, svaTypography, itemWidth, sidePad]
  );

  const today = useMemo(() => atMidnight(new Date()), []);
  const selected = useMemo(() => atMidnight(value), [value]);

  const days = useMemo(() => {
    // Generate range: Today - range ... Today ... Today + range
    const total = 2 * daysAroundToday + 1;
    return Array.from(
      { length: total },
      (_, i) => atMidnight(addDays(subDays(today, daysAroundToday), i)) // Start from past
    );
  }, [today, daysAroundToday]);

  const selectedIdx = useMemo(
    () => days.findIndex((d) => d.getTime() === selected.getTime()),
    [days, selected]
  );

  const initialIndex = useMemo(
    () => Math.max(0, selectedIdx - 2),
    [selectedIdx]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={days}
        keyExtractor={(d) => d.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        decelerationRate="normal"
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: sidePad + itemWidth * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        initialNumToRender={15}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index,
              animated: false,
              viewPosition: 0,
            });
          }, 0);
        }}
        renderItem={({ item }) => {
          const isSelected = isSameDay(item, selected);
          const dayLabel = item
            .toLocaleDateString(undefined, { weekday: "short" })
            .toUpperCase();
          const dateLabel = String(item.getDate()).padStart(2, "0");

          return (
            <TouchableOpacity
              key={item.toISOString()}
              onPress={() => onChange(item)} // Immediate selection + API call via parent
              disabled={isLoading && isSelected}
              activeOpacity={0.8}
              style={[styles.dateBox, isSelected && styles.selectedBox]}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {dayLabel}
              </Text>

              {isLoading && isSelected ? (
                <ActivityIndicator
                  size="small"
                  color={isSelected ? theme.focus : theme.textSecondary}
                />
              ) : (
                <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                  {dateLabel}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styling = (
  theme: ColorSet,
  svaTypography: TypographyTokens,
  itemWidth: number,
  sidePad: number
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingTop: 2,
      paddingBottom: 4,
    },
    listContent: {
      paddingHorizontal: sidePad,
      paddingVertical: 2,
    },
    dateBox: {
      width: itemWidth,
      minHeight: 72,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 6,
      backgroundColor: "transparent",
    },
    selectedBox: {
      backgroundColor: "rgba(74, 84, 63, 0.96)",
      borderWidth: 1,
      borderColor: "rgba(215,227,200,0.10)",
      shadowColor: "rgba(0,0,0,0.32)",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    },
    dayText: {
      ...svaTypography.textStyle.authTinyLabel,
      letterSpacing: 1.6,
      color: theme.textSecondary,
      textTransform: "uppercase",
      textAlign: "center",
    },
    dateText: {
      ...svaTypography.textStyle.title,
      color: theme.textSecondary,
      marginTop: 5,
      textAlign: "center",
    },
    selectedText: {
      color: theme.focus,
    },
  });
