import React, { useContext, useEffect, useState } from "react";
import { View, Platform, StyleSheet, ScrollView, Text } from "react-native";
import { useNavigation } from "expo-router";

import { ScreenView } from "@/components/ui/Themed";
import ThemeContext from "@/contexts/ThemeContext";

import StyledInput from "@/components/ui/theme-components/StyledInput";
import StyledButton from "@/components/ui/theme-components/StyledButton";
import NimbusDropdown from "@/components/ui/theme-components/NimbusDropdown";
import ToolScreenHeader from "@/features/tools/components/common/ToolScreenHeader";
// =======
// import StyledInput from "@/components/common/themeComponents/StyledInput";
// import StyledButton from "@/components/common/themeComponents/StyledButton";
// import NimbusDropdown from "@/components/common/themeComponents/NimbusDropdown";
// import AppHeader from "@/components/common/AppHeader";

import { getCalorieIntakeInfo } from "@/features/tools/services/toolService";
import {
  calorieCalculatorRequest,
  calorieCalculatorResponse,
} from "@/features/tools/types/toolsTypes";
import { activityLevelList, genderList } from "@/constants/data/tools";
import AppHeader from "@/components/layout/AppHeader";

export const CalorieCalculatorScreen = () => {
  const navigation = useNavigation();
  const { newTheme, spacing, svaTypography } = useContext(ThemeContext);
  const styles = styling(newTheme, spacing, svaTypography);

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [openGender, setOpenGender] = useState(false);
  const [genderValue, setGenderValue] = useState<number | null>(null);

  const [openActivity, setOpenActivity] = useState(false);
  const [activityValue, setActivityValue] = useState<number | null>(null);

  const [result, setResult] = useState<calorieCalculatorResponse | null>(null);

  const [genderItems, setGenderItems] = useState(
    genderList.map((g) => ({
      label: g.label,
      value: g.id,
    }))
  );

  const [activityItems, setActivityItems] = useState(
    activityLevelList.map((a) => ({
      label: a.label,
      value: a.id,
    }))
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNumericInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setter(cleaned);
  };

  const validateInputs = () => {
    if (!age || !height || !weight || !genderValue || !activityValue) {
      return false;
    }
    return true;
  };

  const onSubmitClick = async (request: calorieCalculatorRequest) => {
    try {
      const res = await getCalorieIntakeInfo(request);
      if (res) setResult(res);
    } catch (err) {
      console.log(err, "Calorie API Error");
    }
  };

  const handleCalculate = () => {
    if (!validateInputs()) return;

    const activityItem = activityLevelList.find(
      (item) => item.id === activityValue
    );
    const genderItem = genderList.find((item) => item.id === genderValue);

    const request: calorieCalculatorRequest = {
      weight,
      height,
      age,
      gender: genderItem?.value ?? "",
      activityLevel: activityItem?.keyword ?? "",
    };

    onSubmitClick(request);
  };

  const subtitle =
    "Estimate how many calories you need each day based on your body and activity level.";

  return (
    <ScreenView
      style={{
        paddingTop:
          Platform.OS === "ios"
            ? spacing["xxl"] + spacing["xxl"] * 0.2
            : spacing.xl,
        paddingHorizontal: spacing.md,
      }}
    >
      <View style={styles.container}>
        <AppHeader
          title="Calorie Intake Calculator"
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <NimbusDropdown<number>
              label="Gender"
              open={openGender}
              setOpen={setOpenGender}
              value={genderValue}
              setValue={setGenderValue}
              items={genderItems}
              setItems={setGenderItems}
              placeholder="Select gender"
              zIndex={3000}
              zIndexInverse={2000}
              containerStyle={{ marginBottom: spacing.md }}
            />

            <StyledInput
              label="Age"
              value={age}
              keyboardType="number-pad"
              onChangeText={(text) => handleNumericInput(text, setAge)}
              placeholder="Enter your age"
              containerStyle={{ marginBottom: spacing.md }}
            />

            <StyledInput
              label="Height (cm)"
              value={height}
              keyboardType="number-pad"
              onChangeText={(text) => handleNumericInput(text, setHeight)}
              placeholder="Enter your height"
              containerStyle={{ marginBottom: spacing.md }}
            />

            <StyledInput
              label="Weight (kg)"
              value={weight}
              keyboardType="number-pad"
              onChangeText={(text) => handleNumericInput(text, setWeight)}
              placeholder="Enter your weight"
              containerStyle={{ marginBottom: spacing.lg }}
            />
            <NimbusDropdown<number>
              label="Activity Level"
              open={openActivity}
              setOpen={setOpenActivity}
              value={activityValue}
              setValue={setActivityValue}
              items={activityItems}
              setItems={setActivityItems}
              placeholder="Select activity level"
              zIndex={2000}
              zIndexInverse={1000}
            />

            <StyledButton
              label="Calculate Calories"
              variant="primary"
              fullWidth
              onPress={handleCalculate}
              style={{ marginTop: spacing.lg }}
            />
          </View>

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Daily targets</Text>

              <Text style={styles.resultLine}>
                Maintenance: {result.maintenanceCalories} kcal
              </Text>
              <Text style={styles.resultLine}>
                Mild Weight Loss: {result.goals.mildWeightLoss.calories} kcal
              </Text>
              <Text style={styles.resultLine}>
                Weight Loss: {result.goals.weightLoss.calories} kcal
              </Text>
              <Text style={styles.resultLine}>
                Mild Weight Gain: {result.goals.mildWeightGain.calories} kcal
              </Text>
              <Text style={styles.resultLine}>
                Weight Gain: {result.goals.weightGain.calories} kcal
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenView>
  );
};

const styling = (theme: any, spacing: any, svaTypography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: spacing.md,
    },
    card: {
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.surfaceMuted ?? "#181C18",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.divider,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    resultCard: {
      marginTop: spacing.lg,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.divider,
    },
    resultTitle: {
      ...svaTypography.textStyle.caption,
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    resultLine: {
      ...svaTypography.textStyle.caption,
      color: theme.textPrimary,
      marginTop: 4,
    },
  });
