import React, { ReactNode, useContext } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { SVATypography } from "@/theme/typography";
import { tokens } from "@/theme/tokens";

export function SvaAuthLayout({
  step,
  total,
  onBack,
  children,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  children: ReactNode;
}) {
  const { svaColors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.screen, { backgroundColor: svaColors.bg.base }]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={s.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.content,
            {
              paddingTop: insets.top + 6,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <View
            style={[
              s.topBar,
              {
                borderBottomColor: svaColors.border.muted,
              },
            ]}
          >
            <Text style={[s.brandWordmark, { color: svaColors.brand.primary }]}>
              SVA
            </Text>
          </View>

          <View
            style={[
              s.progressTrack,
              {
                backgroundColor: svaColors.surface.base,
                borderColor: svaColors.border.muted,
              },
            ]}
          >
            <View
              testID="auth-progress-fill"
              style={[
                s.progressFill,
                {
                  width: `${Math.max(0, Math.min(1, step / total)) * 100}%`,
                  backgroundColor: svaColors.brand.primary,
                },
              ]}
            />
          </View>

          <View style={s.backRow}>
            <Pressable
              onPress={onBack}
              disabled={!onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                s.backBtn,
                {
                  // backgroundColor: svaColors.surface.raised,
                  // borderColor: svaColors.border.default,
                  opacity: !onBack ? 0 : pressed ? 0.9 : 1,
                },
              ]}
              hitSlop={12}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={svaColors.text.primary}
              />
            </Pressable>
          </View>

          <View style={s.body}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: tokens.layout.screenX,
  },
  topBar: {
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandWordmark: {
    ...SVATypography.textStyle.brandWordmark,
  },
  backRow: {
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 0,
    paddingLeft: 0,
  },
  backBtn: {
    // width: 40,
    // height: 40,
    // borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 0,
  },
  progressTrack: {
    height: 2,
    borderRadius: 999,
    marginTop: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  body: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 8,
  },
});
