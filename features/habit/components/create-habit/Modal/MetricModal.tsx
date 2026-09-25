import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ThemeContext from "@/contexts/ThemeContext";

import StyledButton from "@/components/ui/theme-components/StyledButton"; // adjust path if required
import InputField from "@/components/ui/theme-components/StyledInput";
import SelectableListModal, {
  SelectableItem,
} from "@/components/ui/modal/SelectableListModal";

// ---- Types (adjust per your project) ----
export type HabitUnit = { id: number; name: string };
export type MetricFormat = { count: string; unit: number; label?: string };
type EditData = { count: string; unit: number };

interface HabitMetricModalProps {
  visible: boolean;
  habitUnitList: HabitUnit[];
  onClose: () => void;
  isEditMode?: EditData | null;
  onSave: (value: MetricFormat) => void;
}

// ---- Main metric modal ----
export default function HabitMetricModal({
  visible,
  habitUnitList,
  onClose,
  isEditMode,
  onSave,
}: HabitMetricModalProps) {
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [target, setTarget] = useState<string>("");
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setTarget(String(isEditMode.count ?? ""));
      setSelectedUnitId(isEditMode.unit ?? null);
    } else {
      setTarget("");
      setSelectedUnitId(null);
    }
  }, [isEditMode, visible]);

  const selectedLabel = useMemo(
    () => habitUnitList.find((u) => u.id === selectedUnitId)?.name ?? "",
    [habitUnitList, selectedUnitId]
  );

  useEffect(() => {
    if (!habitUnitList || habitUnitList.length === 0) return;
    setLoadingUnits(false);
  }, [habitUnitList]);

  const handleSave = () => {
    if (!target || !selectedUnitId) return;
    onSave({ count: target, unit: selectedUnitId, label: selectedLabel });
    onClose();
  };

  const handleSavePress = () => {
    handleSave();
  };

  const { newTheme } = React.useContext(ThemeContext);
  const styles = styling(newTheme);

  const unitOptions: SelectableItem[] = habitUnitList.map((u) => ({
    id: u.id,
    title: u.name,
    // optional: add context later
    // subtitle: u.id === ... ? "Best for water intake" : undefined,
  }));

  return (
    <>
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centering}
        >
          <SafeAreaView style={{ width: "100%" }}>
            {/* Card (centered) */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: newTheme.surface,
                  borderColor: newTheme.divider,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: newTheme.textPrimary }]}>
                  Select Habit Metrics
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={22}
                    color={newTheme.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              {/* Unit selector */}
              <Text style={[styles.label, { color: newTheme.textSecondary }]}>
                Measure in
              </Text>

              {/* Unit chooser - opens centered UnitPickerModal */}
              <TouchableOpacity
                style={[
                  styles.selector,
                  {
                    borderColor: newTheme.divider,
                    backgroundColor: newTheme.background,
                  },
                ]}
                onPress={() => setUnitPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: selectedUnitId
                      ? newTheme.textPrimary
                      : newTheme.textSecondary,
                  }}
                >
                  {selectedUnitId ? selectedLabel : "Select an item"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={newTheme.textSecondary}
                />
              </TouchableOpacity>

              <InputField
                label="Daily goal"
                value={target}
                onChangeText={setTarget}
                placeholder="What’s your daily target"
              />

              <View style={{ height: 18 }} />

              {/* CTA */}
              <View style={styles.cta}>
                <StyledButton
                  label="Save"
                  onPress={handleSavePress}
                  disabled={!target || !selectedUnitId}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>

        <SelectableListModal
          visible={unitPickerOpen}
          onClose={() => setUnitPickerOpen(false)}
          title="Select unitss"
          options={unitOptions}
          selectedId={selectedUnitId}
          onSelect={(item) => {
            setSelectedUnitId(Number(item.id));
            setUnitPickerOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

/* ----- styles ----- */
const styling = (newTheme: any) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    centering: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 22,
    },
    card: {
      borderRadius: 14,
      overflow: "hidden",
      paddingHorizontal: 16,
      paddingVertical: 22,
      borderWidth: 1,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
    },
    label: {
      fontSize: 13,
      marginBottom: 8,
      fontWeight: "600",
      color: newTheme.textSecondary,
    },
    selector: {
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    cta: {
      marginTop: 12,
    },
    saveButton: {
      width: "100%",
      borderRadius: 10,
      paddingVertical: 12,
    },
  });
