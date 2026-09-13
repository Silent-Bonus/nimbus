import React, { useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
  Pressable,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/contexts/ThemeContext";
import ModalHeader from "@/components/ui/modal/ModalHeader";

export type SelectableItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  rightHint?: string; // optional (e.g. "Recommended")
  disabled?: boolean;
};

type Props<T extends SelectableItem> = {
  visible: boolean;
  onClose: () => void;

  title: string;
  subtitle?: string;
  options: T[];

  selectedId?: T["id"] | null;
  onSelect: (item: T) => void;

  /** Optional */
  maxHeight?: number; // default 360
  style?: StyleProp<ViewStyle>;
};

export default function SelectableListModal<T extends SelectableItem>({
  visible,
  onClose,
  title,
  subtitle,
  options,
  selectedId = null,
  onSelect,
  maxHeight = 360,
  style,
}: Props<T>) {
  const fade = useRef(new Animated.Value(0)).current;
  const { newTheme, spacing } = React.useContext(ThemeContext);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: visible ? 230 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, fade]);

  const styles = useMemo(
    () => makeStyles(newTheme, spacing),
    [newTheme, spacing]
  );

  const renderItem = ({ item }: { item: T }) => {
    const isSelected = item.id === selectedId;
    const isDisabled = !!item.disabled;

    return (
      <Pressable
        onPress={() => {
          if (isDisabled) return;
          onSelect(item);
        }}
        android_ripple={{ color: "rgba(255,255,255,0.06)" }}
        style={({ pressed }) => [
          styles.row,
          isSelected && styles.rowSelected,
          isDisabled && styles.rowDisabled,
          pressed && !isDisabled && styles.rowPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      >
        <View style={styles.rowText}>
          <Text
            style={[styles.titleText, isDisabled && styles.mutedText]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {!!item.subtitle && (
            <Text
              style={[styles.subtitleText, isDisabled && styles.mutedText]}
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rowRight}>
          {!!item.rightHint && (
            <View style={styles.hintPill}>
              <Text style={styles.hintText} numberOfLines={1}>
                {item.rightHint}
              </Text>
            </View>
          )}

          {isSelected && (
            <View style={styles.tickChip}>
              <Ionicons name="checkmark" size={14} color={newTheme.accent} />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]} />
      </TouchableWithoutFeedback>

      {/* Card */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.card, style]}>
          <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />

          <FlatList
            data={options}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            style={{ maxHeight }}
            contentContainerStyle={{ paddingBottom: spacing.md }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (t: any, spacing: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.divider,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 24,
        },
        android: { elevation: 12 },
      }),
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginLeft: 18,
      opacity: 0.6,
    },

    row: {
      minHeight: 58,
      paddingHorizontal: 18,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.surface,
    },
    rowSelected: {
      backgroundColor: "rgba(255,255,255,0.03)", // subtle Nimbus tint
    },
    rowDisabled: {
      opacity: 0.45,
    },
    rowPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.995 }],
    },

    rowText: {
      flex: 1,
      marginRight: 12,
    },
    titleText: {
      fontSize: 15,
      fontWeight: "500",
      color: t.textPrimary,
    },
    subtitleText: {
      marginTop: 2,
      fontSize: 13,
      color: t.textSecondary,
    },
    mutedText: {
      color: t.textSecondary,
    },

    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tickChip: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },

    hintPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.06)",
    },
    hintText: {
      fontSize: 12,
      fontWeight: "600",
      color: t.textSecondary,
    },
  });
