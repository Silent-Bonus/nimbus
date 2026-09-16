import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ScreenView } from "@/components/Themed";
// import ThemeContext from "@/context/ThemeContext";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// >>>>>

import {
  bodyShapeCalculatorRequest,
  bodyShapeCalculatorResponse,
  // <<
} from "@/features/tools/types/toolsTypes";
import { getBodyShapeInfo } from "@/features/tools/services/toolService";

// Nimbus components
// <<<<<<< HEAD:features/tools/screens/BodyShapeCalculatorScreen.tsx
import InputField from "@/components/ui/theme-components/StyledInput";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import ToolScreenHeader from "@/features/tools/components/common/ToolScreenHeader";
import AppHeader from "@/components/layout/AppHeader";

// =======
// } from "@/types/toolsTypes";
// import { getBodyShapeInfo } from "@/services/toolService";
import { LinearGradient } from "expo-linear-gradient";
import ThemeContext from "@/contexts/ThemeContext";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";

// Types
type BodyShape =
  | "Hourglass"
  | "Rectangle"
  | "Pear"
  | "InvertedTriangle"
  | "Apple"
  | "Undefined";

const shapeIcons: Record<BodyShape, any> = {
  Hourglass: require("@/assets/images/bodyShape/5.png"),
  Rectangle: require("@/assets/images/bodyShape/6.png"),
  Pear: require("@/assets/images/bodyShape/3.png"),
  InvertedTriangle: require("@/assets/images/bodyShape/2.png"),
  Apple: require("@/assets/images/bodyShape/2.png"),
  Undefined: require("@/assets/images/bodyShape/4.png"),
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const RULER_ITEM_WIDTH = 60;
const SPACER_WIDTH = (SCREEN_WIDTH - RULER_ITEM_WIDTH) / 2 - 32; // -32 for padding

// --- Components ---

// Horizontal Ruler Component
const HorizontalRuler = ({
  min,
  max,
  value,
  onChange,
  unit = "",
}: {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
}) => {
  const { newTheme, svaTypography } = useContext(ThemeContext);
  const flatListRef = useRef<FlatList>(null);

  const data = useMemo(() => {
    const range = [];
    for (let i = min; i <= max; i++) {
      range.push(i);
    }
    return range;
  }, [min, max]);

  // Initial scroll position
  useEffect(() => {
    if (flatListRef.current) {
      const index = value - min;
      // Timeout to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, []);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / RULER_ITEM_WIDTH);
    const newValue = min + index;
    if (newValue >= min && newValue <= max && newValue !== value) {
      onChange(newValue);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: RULER_ITEM_WIDTH,
    offset: RULER_ITEM_WIDTH * index,
    index,
  });

  return (
    <View style={styles.rulerContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={RULER_ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: SPACER_WIDTH,
        }}
        onMomentumScrollEnd={handleScroll}
        // onScroll={handleScroll} // Using momentum end for smoother performance, or throttle scroll
        // scrollEventThrottle={16}
        keyExtractor={(item) => item.toString()}
        getItemLayout={getItemLayout}
        renderItem={({ item }) => {
          const isSelected = item === value;
          return (
            <View style={{ width: RULER_ITEM_WIDTH, alignItems: "center" }}>
              <Text
                style={[
                  svaTypography.textStyle.heading2,
                  {
                    color: isSelected
                      ? newTheme.primary // Blue for selected
                      : newTheme.textSecondary, // Grey for others
                    fontSize: isSelected ? 32 : 20,
                    fontWeight: isSelected ? "800" : "400",
                    opacity: isSelected ? 1 : 0.4,
                  },
                ]}
              >
                {item}
              </Text>
              {isSelected && unit ? (
                <Text
                  style={{
                    ...svaTypography.textStyle.caption,
                    color: newTheme.primary,
                    marginTop: -4,
                  }}
                >
                  {unit}
                </Text>
              ) : null}
            </View>
          );
        }}
      />
      {/* Center Indicator (Optional - simplistic approach used above via color) */}
    </View>
  );
};

// Measurement Card Component
const MeasurementCard = ({
  label,
  sublabel,
  icon,
  value,
  onChange,
  min = 20,
  max = 70,
}: {
  label: string;
  sublabel: string;
  icon: any;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}) => {
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: newTheme.surface,
          borderColor: newTheme.borderMuted,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: "rgba(0, 122, 255, 0.1)" },
          ]}
        >
          <Ionicons name={icon} size={22} color={newTheme.primary} />
        </View>
        <View style={styles.cardTexts}>
          <Text
            style={[
              svaTypography.textStyle.title,
              { color: newTheme.textPrimary, fontSize: 18 },
            ]}
          >
            {label}
          </Text>
          <Text style={[svaTypography.textStyle.caption, { color: newTheme.textSecondary }]}>
            {sublabel}
          </Text>
        </View>
        {/* Current Value Display (Static) */}
        <Text style={[svaTypography.textStyle.heading1, { color: newTheme.primary }]}>
          {value}
        </Text>
      </View>

      {/* Picker */}
      <View style={styles.pickerWrapper}>
        <HorizontalRuler
          min={min}
          max={max}
          value={value}
          onChange={onChange}
        />
      </View>
    </View>
  );
};

// --- Main Screen ---

const BodyShapeCalculator = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);

  // Measurements State (Inches by default based on screenshot, but code uses cm? Screenshot says "INCHES")
  // The existing code used generic numbers. I'll stick to the existing code's logic but adapted.
  // Wait, existing code had "Bust (cm)". Screenshot says "INCHES".
  // I will use CM to be consistent with previous code logic OR switch to Inches.
  // If I switch to inches, I might break the calculation logic if it expects CM specific ratios.
  // The calculation uses ratios (bust/hip), so unit doesn't matter for *ratios*, but "bust - hip <= bust * 0.05" is unit-agnostic (percentage).
  // "bust - waist <= bust * 0.08" is also unit agnostic.
  // So I can use Inches.
  // Default values in inches: 36, 28, 34, 40.

  const [measurements, setMeasurements] = useState({
    bust: 36,
    waist: 28,
    highHip: 34,
    lowHip: 40,
  });

  const [result, setResult] = useState<BodyShape | null>(null);
  const [icon, setIcon] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<bodyShapeCalculatorResponse | null>(
    null
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleValueChange = (key: keyof typeof measurements, val: number) => {
    setMeasurements((prev) => ({ ...prev, [key]: val }));
  };

  const calculateBodyShape = async () => {
    const { bust, waist, highHip, lowHip: hip } = measurements;

    setIsLoading(true);

    const bustHipDiff = Math.abs(bust - hip);
    const waistToBust = (waist / bust) * 100;
    const waistToHip = (waist / hip) * 100;

    let shape: BodyShape;

    // Logic from previous code (works with any unit as it uses ratios/percentages)
    if (bustHipDiff <= bust * 0.05 && waistToBust < 75 && waistToHip < 75) {
      shape = "Hourglass";
    } else if (
      Math.abs(bust - waist) <= bust * 0.08 &&
      Math.abs(hip - waist) <= hip * 0.08
    ) {
      shape = "Rectangle";
    } else if (hip > bust * 1.05) {
      shape = "Pear";
    } else if (bust > hip * 1.05) {
      shape = "InvertedTriangle";
    } else if (waist > bust && waist > hip) {
      shape = "Apple";
    } else {
      shape = "Undefined";
    }

    setResult(shape);
    const shapeIcon = shapeIcons[shape];
    setIcon(shapeIcon);

    await AsyncStorage.setItem(
      "bodyShapeResult",
      JSON.stringify({ shape, icon: shapeIcon })
    );

    const request: bodyShapeCalculatorRequest = {
      bust: bust.toString(),
      waist: waist.toString(),
      highHip: highHip.toString(),
      lowHip: hip.toString(),
    };

    await onSubmitClick(request);
    setIsLoading(false);
  };

  const onSubmitClick = async (request: bodyShapeCalculatorRequest) => {
    try {
      const result = await getBodyShapeInfo(request);
      if (result) {
        setResponse(result);
      }
    } catch (error: any) {
      console.log(error, "API Error Response");
    }
  };

  // If result is present, show result screen (or modal). For now, I'll just show it below or overlay.
  // The screenshot implies this is the INPUT screen.
  // I'll show an alert or a result modal for simplicity, or render the result card if it exists.

  return (
    <ScreenView
      style={{
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingHorizontal: spacing.md,
        backgroundColor: newTheme.background, // Should be dark
      }}
    >
      {/* Custom Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={newTheme.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[svaTypography.textStyle.title, { color: newTheme.textPrimary }]}>
          Body Blueprint
        </Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Help", "Measure accurately for best results.")
          }
          style={styles.iconButton}
        >
          <Ionicons
            name="help-circle-outline"
            size={24}
            color={newTheme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text
            style={[
              svaTypography.textStyle.heading1,
              { color: newTheme.textPrimary, fontSize: 32 },
            ]}
          >
            Body Blueprint
          </Text>
          <Text
            style={[
              svaTypography.textStyle.body,
              { color: newTheme.textSecondary, marginTop: 4 },
            ]}
          >
            Map your physical essence
          </Text>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>PRECISE MEASUREMENTS (INCHES)</Text>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <MeasurementCard
            label="Bust Size"
            sublabel="Fullest point"
            icon="body-outline"
            value={measurements.bust}
            onChange={(v) => handleValueChange("bust", v)}
            min={20}
            max={60}
          />
          <MeasurementCard
            label="Waist Size"
            sublabel="Narrowest point"
            icon="cut-outline"
            value={measurements.waist}
            onChange={(v) => handleValueChange("waist", v)}
            min={15}
            max={50}
          />
          <MeasurementCard
            label="High Hip"
            sublabel="Pelvic bone"
            icon="fitness-outline"
            value={measurements.highHip}
            onChange={(v) => handleValueChange("highHip", v)}
            min={20}
            max={60}
          />
          <MeasurementCard
            label="Low Hip"
            sublabel="Widest point"
            icon="layers-outline"
            value={measurements.lowHip}
            onChange={(v) => handleValueChange("lowHip", v)}
            min={25}
            max={70}
          />
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: "rgba(255, 255, 255, 0.05)" },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={24}
            color={newTheme.primary}
            style={{ marginRight: 12 }}
          />
          <Text
            style={[
              svaTypography.textStyle.caption,
              { color: newTheme.textSecondary, flex: 1, lineHeight: 18 },
            ]}
          >
            For the most accurate assessment, take measurements while standing
            straight with relaxed breathing. Ensure the tape is level around the
            body.
          </Text>
        </View>

        {/* Result Display (Inline for now) */}
        {(result || response) && (
          <View style={[styles.resultCard, { borderColor: newTheme.primary }]}>
            <View style={styles.resultTextPart}>
              <Text style={styles.resultLabel}>YOUR SHAPE</Text>
              <Text style={[svaTypography.textStyle.heading2, { color: newTheme.textPrimary }]}>
                {result}
              </Text>
              {response?.shape && response.shape !== result && (
                <Text style={styles.aiSuggestion}>AI: {response.shape}</Text>
              )}
            </View>
            {icon && <Image source={icon} style={styles.shapeIcon} />}
          </View>
        )}
      </ScrollView>

      {/* Floating Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={calculateBodyShape}
          disabled={isLoading}
          activeOpacity={0.8}
          style={[
            styles.primaryButton,
            { backgroundColor: newTheme.primary }, // Use Blue
          ]}
        >
          <Text
            style={[
              svaTypography.textStyle.button,
              { color: "#FFFFFF", fontSize: 18, marginRight: 8 },
            ]}
          >
            {isLoading ? "Analyzing..." : "Determine My Form"}
          </Text>
          {!isLoading && (
            <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </ScreenView>
  );
};

// Styles
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  titleBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280", // Muted grey
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTexts: {
    flex: 1,
  },
  pickerWrapper: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  rulerContainer: {
    flex: 1,
    height: 50,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    // Gradient or blur could go here
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 64,
    borderRadius: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  resultCard: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    marginBottom: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  resultTextPart: { flex: 1 },
  resultLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  shapeIcon: { width: 60, height: 60, resizeMode: "contain" },
  aiSuggestion: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default BodyShapeCalculator;
