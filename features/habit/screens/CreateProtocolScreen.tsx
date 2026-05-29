import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";
import ThemeContext from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import {
  createHabit,
  getHabitTag,
  getHabitType,
  getHabitUnitData,
} from "@/features/habit/services/habitService";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { ROUTES } from "@/constants/routes";
import HabitDurationInput from "@/features/habit/components/create-habit/HabitDurationInput";
import HabitTagsModal from "@/features/habit/components/create-habit/Modal/HabitTagsModal";
import StartDateModal from "@/features/habit/components/create-habit/Modal/StartDateModal";
import TimePickerSheet from "@/components/ui/picker/TimePickerSheet";
import ProcessingModal from "@/components/ui/modal/ProcessingModal";
import ProtocolColorPickerModal, {
  PROTOCOL_COLOR_OPTIONS,
  type ProtocolColorOption,
} from "@/features/habit/components/create-protocol/Modal/ProtocolColorPickerModal";
import ProtocolTypePickerModal from "@/features/habit/components/create-protocol/Modal/ProtocolTypePickerModal";
import ProtocolUnitPickerModal from "@/features/habit/components/create-protocol/Modal/ProtocolUnitPickerModal";
import {
  formatTimeUI,
  toBackendTime,
  fromApiDate,
  fromHHmm,
  toApiDate,
  toFriendlyDate,
} from "@/utils/date-time";
import { formatProtocolFrequencySummary } from "@/features/habit/utils/protocolDisplay";
import {
  HabitDateType,
  HabitTag,
  HabitUnit,
  HabitType,
} from "@/features/habit/types/habitTypes";

const PROCESSING_MODAL_MIN_VISIBLE_MS = 6000;

const CreateProtocolScreen = () => {
  const { svaColors, svaTypography, spacing } = useContext(ThemeContext);
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    title?: string | string[];
    reminder?: string | string[];
  }>();
  const toast = useNimbusToast();

  // Core State
  const [name, setName] = useState("");
  const [metricValue, setMetricValue] = useState(10);
  const [metricUnit, setMetricUnit] = useState<HabitUnit>({
    id: 1,
    name: "Minutes",
  });
  const [protocolDuration, setProtocolDuration] = useState<any>({
    all_day: true,
  });
  const [origin, setOrigin] = useState<HabitDateType | null>(null);
  const [protocolTypes, setProtocolTypes] = useState<HabitType[]>([]);
  const [selectedProtocolType, setSelectedProtocolType] =
    useState<HabitType | null>(null);
  const [natureTags, setNatureTags] = useState<HabitTag[]>([]);
  const [reminderTime, setReminderTime] = useState(() => new Date());

  // Divine Defaults State
  const [emoji, setEmoji] = useState("🙂");
  const [selectedColor, setSelectedColor] = useState<ProtocolColorOption>(
    PROTOCOL_COLOR_OPTIONS[3]
  ); // Default Moss Aura
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingModalVisible, setIsProcessingModalVisible] =
    useState(false);

  // Modals State
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isUnitPickerOpen, setIsUnitPickerOpen] = useState(false);
  const [isOriginPickerOpen, setIsOriginPickerOpen] = useState(false);
  const [isProtocolTypeOpen, setIsProtocolTypeOpen] = useState(false);
  const [isNaturePickerOpen, setIsNaturePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [unitOptions, setUnitOptions] = useState<HabitUnit[]>([]);
  const [natureOptions, setNatureOptions] = useState<HabitTag[]>([]);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    fetchUnits();
  }, [navigation]);

  useEffect(() => {
    const titleParam = Array.isArray(params.title)
      ? params.title[0]
      : params.title;
    const reminderParam = Array.isArray(params.reminder)
      ? params.reminder[0]
      : params.reminder;

    if (titleParam) {
      setName((prev) => prev || titleParam);
    }

    if (reminderParam) {
      setReminderTime(fromHHmm(reminderParam));
    }
  }, [params.title, params.reminder]);

  useEffect(() => {
    fetchNatureTags();
    fetchProtocolTypes();
  }, []);

  const fetchUnits = async () => {
    try {
      const result = await getHabitUnitData();
      if (result?.success) {
        setUnitOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchNatureTags = async () => {
    try {
      const result = await getHabitTag();
      if (result?.success) {
        setNatureOptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching nature tags:", error);
    }
  };

  const fetchProtocolTypes = async () => {
    try {
      const result = await getHabitType();
      if (result?.success) {
        setProtocolTypes(result.data);
        setSelectedProtocolType((prev) => prev ?? result.data[0] ?? null);
      }
    } catch (error) {
      console.error("Error fetching protocol types:", error);
    }
  };

  const reminderTimeLabel = useMemo(
    () => formatTimeUI(reminderTime),
    [reminderTime]
  );

  const originLabel = useMemo(() => {
    if (!origin?.start_date) return "Today";
    return toFriendlyDate(origin.start_date);
  }, [origin]);

  const originSummaryLabel = useMemo(
    () => formatProtocolFrequencySummary(origin),
    [origin]
  );

  const protocolTypeLabel = useMemo(() => {
    if (!selectedProtocolType?.name) return "Select Type";
    return selectedProtocolType.name;
  }, [selectedProtocolType]);

  const normalizeDateValue = (value?: Date | string | null) => {
    if (!value) return undefined;
    const parsed = value instanceof Date ? value : fromApiDate(value);
    return toApiDate(parsed);
  };

  const normalizeFrequencyForBackend = (value?: HabitDateType | null) => {
    const payload: any = {
      start_date:
        normalizeDateValue(value?.start_date) ?? toApiDate(new Date()),
    };

    const endDate = normalizeDateValue(value?.end_date);
    if (endDate) payload.end_date = endDate;

    if (value?.frequency_type) payload.frequency_type = value.frequency_type;
    if (typeof value?.interval === "number") payload.interval = value.interval;
    if (value?.days_of_week?.length) payload.days_of_week = value.days_of_week;
    if (value?.days_of_month?.length)
      payload.days_of_month = value.days_of_month;

    return payload;
  };

  const getFormattedTag = () => {
    let value;
    if (natureTags) {
      const oldIds =
        natureTags?.filter((it) => it.id !== 0).map((it) => it.id) || [];
      const newTag = natureTags?.find((it) => it.id === 0)?.name || "";
      if (newTag) value = { old: oldIds, new: [newTag] };
      else value = { old: oldIds };
    } else value = {};
    return value;
  };

  const natureValueLabel = useMemo(() => {
    if (!natureTags.length) return "Select Tags";
    if (natureTags.length === 1) return natureTags[0].name || "1 Tag Selected";
    return `${natureTags.length} Tags Selected`;
  }, [natureTags]);

  const handleNatureTagSelect = (tag: HabitTag) => {
    setNatureTags((prevTags) => {
      const exists = prevTags.some((item) => item.id === tag.id);
      if (exists) return prevTags;
      return [...prevTags, tag];
    });
  };

  const handleNatureTagRemove = (index: number) => {
    setNatureTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  const validateAndBuild = () => {
    if (!name.trim()) return { ok: false, msg: "Please enter a ritual name." };
    const habitFrequency = normalizeFrequencyForBackend(origin);

    const payload = {
      name: name.trim(),
      habit_type_id: selectedProtocolType?.id ?? 0,
      color: selectedColor.value,
      habit_metric: {
        count: metricValue.toString(),
        unit: metricUnit.id,
      },
      habit_duration: protocolDuration,
      habit_frequency: habitFrequency,
      tags: getFormattedTag(),
      icon: emoji,
      remind_at: { time: toBackendTime(reminderTime) },
    };

    return { ok: true, payload };
  };

  const onSubmitClick = async () => {
    const { ok, payload, msg } = validateAndBuild() as any;
    if (!ok) {
      toast.show({ variant: "error", title: "Validation Error", message: msg });
      return;
    }

    const processingStartedAt = Date.now();
    setIsLoading(true);
    setIsProcessingModalVisible(true);
    try {
      const result = await createHabit(payload);
      const elapsed = Date.now() - processingStartedAt;
      if (elapsed < PROCESSING_MODAL_MIN_VISIBLE_MS) {
        await wait(PROCESSING_MODAL_MIN_VISIBLE_MS - elapsed);
      }

      if (result?.success) {
        setIsProcessingModalVisible(false);
        toast.show({
          variant: "success",
          title: "Ritual Sealed",
          message: "Your ritual has been architected successfully.",
        });
        setTimeout(() => {
          router.replace(ROUTES.TABS.HOME);
        }, 300);
      } else {
        setIsProcessingModalVisible(false);
        toast.show({
          variant: "error",
          title: "Architecture Failed",
          message: result?.message || "Failed to seal the ritual.",
        });
      }
    } catch {
      const elapsed = Date.now() - processingStartedAt;
      if (elapsed < PROCESSING_MODAL_MIN_VISIBLE_MS) {
        await wait(PROCESSING_MODAL_MIN_VISIBLE_MS - elapsed);
      }

      setIsProcessingModalVisible(false);
      toast.show({
        variant: "error",
        title: "Network Error",
        message: "Unable to reach the collective consciousness.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = (obj: EmojiType) => {
    setEmoji(obj.emoji);
    setIsEmojiPickerOpen(false);
  };

  const styles = styling(svaColors, svaTypography, spacing);

  return (
    <>
      <ScreenView bgColor={svaColors.bg.base} style={styles.screenView}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.root}>
            <AppHeader
              title="Ritual Architect"
              subtitle="Craft your formula with intention."
              onBack={() => router.back()}
              containerStyle={styles.header}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Section 1: Core Details */}
              <View style={styles.section}>
                <Text style={styles.label}>RITUAL NAME</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="e.g., Morning Yoga"
                  placeholderTextColor={svaColors.text.disabled}
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>METRIC</Text>
                <View style={styles.metricRow}>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        setMetricValue(Math.max(1, metricValue - 1))
                      }
                      style={styles.counterBtn}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={svaColors.text.primary}
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{metricValue}</Text>
                    <TouchableOpacity
                      onPress={() => setMetricValue(metricValue + 1)}
                      style={styles.counterBtn}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={svaColors.text.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.unitDropdown}
                    onPress={() => setIsUnitPickerOpen(true)}
                  >
                    <Text style={styles.unitText}>{metricUnit.name}</Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={svaColors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.durationSection}>
                  <Text style={styles.label}>RHYTHM</Text>
                  <HabitDurationInput
                    onSelect={setProtocolDuration}
                    compact
                    showIcon={false}
                    showLabel={false}
                    style={styles.durationChip}
                  />
                </View>

                <View style={styles.reminderSection}>
                  <Text style={styles.label}>YOUR DAILY NUDGE</Text>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.reminderTrigger}
                    onPress={() => setIsTimePickerOpen(true)}
                  >
                    <Text style={styles.reminderValue}>
                      {reminderTimeLabel}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={svaColors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Section 2: Divine Defaults */}
              <View style={styles.divineCard}>
                <View style={styles.divineHeader}>
                  <Text style={styles.divineTitle}>DIVINE DEFAULTS</Text>
                </View>

                <View style={styles.gridContainer}>
                  <TouchableOpacity
                    style={[styles.gridItem, styles.fullWidthItem]}
                    onPress={() => setIsOriginPickerOpen(true)}
                  >
                    <View
                      style={[
                        styles.gridCompactBlock,
                        styles.gridCompactBlockWide,
                      ]}
                    >
                      <View style={styles.gridTileHeader}>
                        <Text style={styles.gridLabel}>GENESIS</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={svaColors.text.secondary}
                        />
                      </View>
                      <View style={styles.gridValueStack}>
                        <Text style={styles.gridValueText}>{originLabel}</Text>
                        {!!originSummaryLabel && (
                          <Text style={styles.gridValueSubtext}>
                            {originSummaryLabel}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.gridRow}>
                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => setIsEmojiPickerOpen(true)}
                    >
                      <View style={styles.gridTileHeader}>
                        <Text style={styles.gridLabel}>ESSENCE</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={svaColors.text.secondary}
                        />
                      </View>
                      <View style={styles.gridValueRow}>
                        <Text style={styles.gridEmoji}>{emoji}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.gridItem}
                      onPress={() => setIsColorPickerOpen(true)}
                    >
                      <View style={styles.gridTileHeader}>
                        <Text style={styles.gridLabel}>AURA</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={svaColors.text.secondary}
                        />
                      </View>
                      <View style={styles.gridValueRow}>
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: selectedColor.value },
                          ]}
                        />
                        <Text style={styles.gridValueText}>
                          {selectedColor.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.gridItem, styles.fullWidthItem]}
                    onPress={() => setIsProtocolTypeOpen(true)}
                  >
                    <View style={styles.gridCompactBlock}>
                      <View style={styles.gridTileHeader}>
                        <Text style={styles.gridLabel}>PROTOCOL TYPE</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={svaColors.text.secondary}
                        />
                      </View>
                      <View style={styles.gridValueRow}>
                        <Text style={styles.gridValueText}>
                          {protocolTypeLabel}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gridItem, styles.fullWidthItem]}
                    onPress={() => setIsNaturePickerOpen(true)}
                  >
                    <View style={styles.gridCompactBlock}>
                      <View style={styles.gridTileHeader}>
                        <Text style={styles.gridLabel}>NATURE</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={svaColors.text.secondary}
                        />
                      </View>
                      <View style={styles.gridValueRow}>
                        <Text style={styles.gridValueText}>
                          {natureValueLabel}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {natureTags.length > 0 && (
                    <View style={styles.natureChips}>
                      {natureTags.map((tag, index) => (
                        <View
                          key={`${tag.id}-${index}`}
                          style={styles.natureChip}
                        >
                          <Text style={styles.natureChipText}>{tag.name}</Text>
                          <TouchableOpacity
                            onPress={() => handleNatureTagRemove(index)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={16}
                              color={svaColors.text.secondary}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Seal Ritual Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.sealButton, isLoading && { opacity: 0.7 }]}
                  onPress={onSubmitClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={svaColors.text.inverse} />
                  ) : (
                    <Text style={styles.sealButtonText}>SEAL RITUAL</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </ScreenView>

      {/* Modals */}
      <EmojiPicker
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelected={handleEmojiSelect}
        theme={{
          backdrop: svaColors.overlay.strong,
          knob: svaColors.brand.primary,
          container: svaColors.bg.subtle,
          header: svaColors.text.primary,
          skinTonesContainer: svaColors.bg.elevated,
          category: {
            icon: svaColors.text.secondary,
            iconActive: svaColors.brand.primary,
            container: svaColors.bg.subtle,
            containerActive: svaColors.bg.elevated,
          },
          search: {
            background: svaColors.bg.elevated,
            text: svaColors.text.primary,
            placeholder: svaColors.text.disabled,
            icon: svaColors.text.secondary,
          },
        }}
      />

      <TimePickerSheet
        visible={isTimePickerOpen}
        value={reminderTime}
        title="Select time"
        onChange={setReminderTime}
        onClose={() => setIsTimePickerOpen(false)}
      />

      <StartDateModal
        visible={isOriginPickerOpen}
        onClose={() => setIsOriginPickerOpen(false)}
        onSave={(value) => setOrigin(value)}
        isEditMode={origin ?? undefined}
        title="Genesis"
        subtitle="Choose the origin point for this protocol."
      />

      <ProtocolTypePickerModal
        visible={isProtocolTypeOpen}
        onClose={() => setIsProtocolTypeOpen(false)}
        title="Select Protocol Type"
        types={protocolTypes}
        selectedTypeId={selectedProtocolType?.id ?? null}
        onSelect={(type) => setSelectedProtocolType(type)}
      />

      <HabitTagsModal
        habitTagList={natureOptions}
        visible={isNaturePickerOpen}
        selectedTagData={natureTags}
        title="Select Nature"
        onClose={() => setIsNaturePickerOpen(false)}
        onSelect={handleNatureTagSelect}
      />

      <ProtocolColorPickerModal
        visible={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        selectedColor={selectedColor}
        onSelect={setSelectedColor}
      />

      <ProtocolUnitPickerModal
        visible={isUnitPickerOpen}
        onClose={() => setIsUnitPickerOpen(false)}
        units={unitOptions}
        selectedUnitId={metricUnit.id}
        onSelect={(unit) => setMetricUnit(unit)}
      />

      <ProcessingModal
        visible={isProcessingModalVisible}
        centerMessage={"Sealing Ritual\nYour protocol is being prepared."}
        footerMessage="Please wait while we sync the backend and open the home screen."
      />
    </>
  );
};

const styling = (colors: any, typography: any, spacing: any) =>
  StyleSheet.create({
    screenView: {
      paddingHorizontal: spacing.md,
      paddingTop:
        Platform.OS === "ios"
          ? spacing["xxl"] + spacing["xxl"] * 0.4
          : spacing.xl,
    },
    root: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    section: {
      marginBottom: spacing.xl,
    },
    label: {
      ...typography.textStyle.authTinyLabel,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    nameInput: {
      ...typography.textStyle.heading2,
      color: colors.text.primary,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.muted,
      marginBottom: spacing.xl,
    },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    counterContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bg.subtle,
      borderRadius: 24,
      padding: 4,
      flex: 1,
    },
    counterBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    counterValue: {
      ...typography.textStyle.title,
      color: colors.text.primary,
      flex: 1,
      textAlign: "center",
    },
    unitDropdown: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bg.subtle,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      height: 48,
      gap: spacing.xs,
    },
    unitText: {
      ...typography.textStyle.body,
      color: colors.text.primary,
    },
    durationSection: {
      alignItems: "flex-start",
      marginBottom: spacing.xl,
    },
    durationChip: {
      alignSelf: "flex-start",
      backgroundColor: colors.bg.subtle,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      height: 48,
      gap: spacing.xs,
    },
    reminderSection: {
      alignItems: "flex-start",
      marginBottom: spacing.xl,
    },
    reminderTrigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "flex-start",
      minWidth: 0,
      backgroundColor: colors.bg.subtle,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      height: 48,
      gap: spacing.xs,
    },
    reminderValue: {
      ...typography.textStyle.body,
      color: colors.text.primary,
      fontWeight: "600",
    },
    divineCard: {
      backgroundColor: colors.surface.base,
      borderRadius: 24,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    divineHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginBottom: spacing.lg,
    },
    divineTitle: {
      ...typography.textStyle.authTinyLabel,
      color: colors.state.info,
    },
    gridContainer: {
      flexDirection: "column",
      gap: spacing.lg,
    },
    gridRow: {
      flexDirection: "row",
      gap: spacing.lg,
    },
    gridItem: {
      flex: 1,
    },
    fullWidthItem: {
      width: "100%",
      flex: 0,
    },
    gridCompactBlock: {
      width: "48%",
      alignSelf: "flex-start",
    },
    gridCompactBlockWide: {
      width: "100%",
      alignSelf: "stretch",
    },
    natureChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    gridTileHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    gridLabel: {
      ...typography.textStyle.authTinyLabel,
      color: colors.text.secondary,
      marginBottom: 0,
    },
    gridValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    gridValueStack: {
      alignItems: "flex-start",
    },
    gridEmoji: {
      fontSize: typography.fontSize.md,
    },
    gridValueText: {
      ...typography.textStyle.subtitle,
      color: colors.text.primary,
      fontWeight: "600",
    },
    gridValueSubtext: {
      marginTop: 3,
      ...typography.textStyle.caption,
      color: colors.text.secondary,
    },
    colorDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    natureChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bg.subtle,
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      gap: 6,
    },
    natureChipText: {
      ...typography.textStyle.caption,
      color: colors.text.primary,
    },
    buttonContainer: {
      marginBottom: spacing.xl,
    },
    sealButton: {
      backgroundColor: colors.brand.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.brand.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    sealButtonText: {
      ...typography.textStyle.button,
      color: colors.text.inverse,
      letterSpacing: 2,
    },
  });

export default CreateProtocolScreen;
