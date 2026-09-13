import React, { useContext, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import ThemeContext from "@/contexts/ThemeContext";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import SelectableListModal, {
  type SelectableItem,
} from "@/components/ui/modal/SelectableListModal";
import { CircadianAlignmentCard } from "@/features/check-in/components/sleep/checkIn/CircadianAlignmentCard";

type RitualReminderSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  reminderOptions: readonly number[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void | Promise<void>;
  bedMinutes?: number;
  wakeMinutes?: number;
  onChangeBed?: (value: number) => void;
  onChangeWake?: (value: number) => void;
};

export default function RitualReminderSettingsModal({
  visible,
  onClose,
  title,
  reminderOptions,
  selectedIndex,
  onSelectIndex,
  bedMinutes,
  wakeMinutes,
  onChangeBed,
  onChangeWake,
}: RitualReminderSettingsModalProps) {
  const { newTheme } = useContext(ThemeContext);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [showCircadianSettings, setShowCircadianSettings] = useState(false);
  const hasCircadianSettings =
    bedMinutes !== undefined &&
    wakeMinutes !== undefined &&
    !!onChangeBed &&
    !!onChangeWake;

  const selectedReminder = reminderOptions[selectedIndex] ?? reminderOptions[0];
  const options = useMemo<SelectableItem[]>(() => {
    const settings: SelectableItem[] = [
      {
        id: "reminder",
        title: "Ritual frequency",
        subtitle: selectedReminder
          ? `Every ${selectedReminder} minutes`
          : "Choose a gentle reminder rhythm",
      },
    ];

    if (hasCircadianSettings) {
      settings.push({
        id: "circadian",
        title: "Circadian alignment",
        subtitle: "Tune your sleep and wake window",
      });
    }

    return settings;
  }, [hasCircadianSettings, selectedReminder]);

  const frequencyOptions = useMemo<SelectableItem[]>(
    () =>
      reminderOptions.map((minutes) => ({
        id: minutes,
        title: `Every ${minutes} minutes`,
      })),
    [reminderOptions]
  );

  const closeAll = () => {
    setShowReminderOptions(false);
    setShowCircadianSettings(false);
    onClose();
  };

  return (
    <>
      <SelectableListModal
        visible={visible && !showReminderOptions && !showCircadianSettings}
        onClose={closeAll}
        title={title}
        subtitle="Personalize your Nidra ritual"
        options={options}
        onSelect={(item) => {
          if (item.id === "reminder") {
            setShowReminderOptions(true);
          } else {
            setShowCircadianSettings(true);
          }
        }}
      />

      <SelectableListModal
        visible={showReminderOptions}
        onClose={closeAll}
        title="Ritual frequency"
        subtitle="A gentle ritual reminder"
        options={frequencyOptions}
        selectedId={selectedReminder ?? null}
        onSelect={(item) => {
          const nextIndex = reminderOptions.indexOf(Number(item.id));
          if (nextIndex >= 0) {
            onSelectIndex(nextIndex);
          }
          closeAll();
        }}
      />

      <Modal
        visible={showCircadianSettings}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={closeAll}
      >
        <TouchableWithoutFeedback onPress={closeAll}>
          <View style={[styles.backdrop, { backgroundColor: newTheme.overlay }]} />
        </TouchableWithoutFeedback>

        <View style={styles.centeredContainer}>
          <View
            style={[
              styles.circadianSheet,
              {
                backgroundColor: newTheme.surface,
                borderColor: newTheme.border,
              },
            ]}
          >
            <ModalHeader
              title="Circadian alignment"
              subtitle="Tune your sleep and wake window"
              onClose={closeAll}
            />

            {hasCircadianSettings ? (
              <CircadianAlignmentCard
                bedMinutes={bedMinutes}
                wakeMinutes={wakeMinutes}
                onChangeBed={onChangeBed}
                onChangeWake={onChangeWake}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  circadianSheet: {
    maxHeight: "92%",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
});
