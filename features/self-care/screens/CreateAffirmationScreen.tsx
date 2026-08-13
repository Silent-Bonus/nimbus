import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "@/components/layout/AppHeader";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import { NimbusButton } from "@/components/ui/theme-components/NimbusButton";
import { ScreenView } from "@/components/ui/theme-components/ScreenView";
import ThemeContext from "@/contexts/ThemeContext";
import { queueCreatedAffirmation } from "@/features/self-care/data/affirmationCreationInbox";
import { createAffirmation } from "@/features/self-care/services/affirmationService";
import { resolveAffirmationToneFromTags } from "@/features/self-care/utils/affirmationHelpers";
import type {
  ColorSet,
  Spacing,
  Typography,
  TypographyTokens,
} from "@/theme/types";

const INITIAL_STATEMENT_COUNT = 3;
const MAX_STATEMENTS = 7;

const STATEMENT_ACCENTS = [
  "rgba(163, 190, 140, 0.16)",
  "rgba(91, 119, 70, 0.16)",
  "rgba(47, 98, 142, 0.14)",
  "rgba(161, 70, 104, 0.14)",
] as const;

const makeStatements = (count = INITIAL_STATEMENT_COUNT) =>
  Array.from({ length: count }, () => "");

const normalizeTagList = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.replace(/^#+/, "").trim().toLowerCase())
    .filter(Boolean);

export const CreateAffirmationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const toast = useNimbusToast();
  const { newTheme: theme, svaTypography, spacing, typography } =
    useContext(ThemeContext);

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [quoteDetail, setQuoteDetail] = useState("");
  const [statements, setStatements] = useState<string[]>(() => makeStatements());
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(
    () => styling(theme, spacing, typography, svaTypography),
    [theme, spacing, typography, svaTypography]
  );

  const normalizedTags = useMemo(() => normalizeTagList(tag), [tag]);
  const canAddStatement = statements.length < MAX_STATEMENTS;
  const canCreate =
    title.trim().length > 0 &&
    quoteDetail.trim().length > 0 &&
    statements.length >= INITIAL_STATEMENT_COUNT &&
    statements.every((statement) => statement.trim().length > 0);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleAddStatement = useCallback(() => {
    if (!canAddStatement) return;

    setStatements((current) => [...current, ""]);
  }, [canAddStatement]);

  const handleChangeStatement = useCallback(
    (index: number, value: string) => {
      setStatements((current) =>
        current.map((entry, currentIndex) =>
          currentIndex === index ? value : entry
        )
      );
    },
    []
  );

  const handleCreate = useCallback(async () => {
    if (!canCreate || isSaving) return;

    const payload = {
      title: title.trim(),
      tone: resolveAffirmationToneFromTags(normalizedTags),
      tags: normalizedTags,
      statements: statements.map((statement) => statement.trim()),
      quote_detail: quoteDetail.trim(),
    };

    setIsSaving(true);

    try {
      const created = await createAffirmation(payload);
      queueCreatedAffirmation(created);
      toast.show({
        variant: "success",
        title: "Affirmation saved",
        message: `"${created.card.title}" is ready in your library.`,
      });
      router.back();
    } catch (error) {
      console.warn("Unable to create custom affirmation:", error);
      toast.show({
        variant: "error",
        title: "Couldn’t create affirmation",
        message: "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [canCreate, isSaving, normalizedTags, quoteDetail, statements, title, toast]);

  return (
    <ScreenView bgColor={theme.background} style={styles.screen}>
      <View style={styles.root}>
        <AppHeader
          title="Create Affirmation"
          subtitle="Start with a title and detail, then stack three to seven lines."
          onBack={() => router.back()}
          containerStyle={styles.header}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacing.xl * 2.2 },
            ]}
          >
            <View style={styles.heroCard}>
              <View
                pointerEvents="none"
                style={[styles.heroGlow, { backgroundColor: theme.accent }]}
              />

              <Text style={styles.heroTitle}>
                Shape a private line set that sounds like you.
              </Text>
              <Text style={styles.heroSubtitle}>
                Begin with a title and detail, add three statements, then
                extend it to a maximum of seven.
              </Text>
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Title</Text>
                <Text style={styles.fieldHint}>Give the deck a name.</Text>
              </View>

              <TextInput
                testID="affirmation-title-input"
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Soft Return"
                placeholderTextColor={theme.textSecondary}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Tags</Text>
                <Text style={styles.fieldHint}>
                  Optional. Separate labels with commas.
                </Text>
              </View>

              <TextInput
                testID="affirmation-tag-input"
                style={styles.tagInput}
                value={tag}
                onChangeText={setTag}
                placeholder="calm, reset, self-trust"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Quote detail</Text>
                <Text style={styles.fieldHint}>
                  One short line that frames the deck.
                </Text>
              </View>

              <TextInput
                testID="affirmation-detail-input"
                style={styles.detailInput}
                value={quoteDetail}
                onChangeText={setQuoteDetail}
                placeholder="A cleaner rhythm for focus, study, and follow-through."
                placeholderTextColor={theme.textSecondary}
                multiline
                autoCapitalize="sentences"
                autoCorrect={false}
                textAlignVertical="top"
                returnKeyType="default"
              />
            </View>

            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionEyebrow}>STATEMENTS</Text>
                <Text style={styles.sectionTitle}>
                  Write the lines that will carry the mood.
                </Text>
              </View>
            </View>

            <View style={styles.statementStack}>
              {statements.map((statement, index) => (
                <View
                  key={`statement-${index}`}
                  style={[
                    styles.statementCard,
                    {
                      borderColor:
                        STATEMENT_ACCENTS[index % STATEMENT_ACCENTS.length],
                    },
                  ]}
                >
                  <View style={styles.statementHeader}>
                    <View
                      style={[
                        styles.statementIndexPill,
                        {
                          backgroundColor:
                            STATEMENT_ACCENTS[index % STATEMENT_ACCENTS.length],
                        },
                      ]}
                    >
                      <Text style={styles.statementIndexText}>
                        Statement {index + 1}
                      </Text>
                    </View>

                    <Text style={styles.statementHint}>Keep it crisp.</Text>
                  </View>

                  <TextInput
                    testID={`affirmation-statement-input-${index}`}
                    style={styles.statementInput}
                    value={statement}
                    onChangeText={(value) =>
                      handleChangeStatement(index, value)
                    }
                    placeholder={`Write statement ${index + 1}`}
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    returnKeyType="default"
                  />
                </View>
              ))}
            </View>

            <Pressable
              testID="add-statement-button"
              accessibilityRole="button"
              accessibilityLabel="Add statement"
              disabled={!canAddStatement}
              onPress={handleAddStatement}
              style={({ pressed }) => [
                styles.addButton,
                !canAddStatement && styles.addButtonDisabled,
                pressed && canAddStatement && styles.addButtonPressed,
              ]}
            >
              <Ionicons
                name="add"
                size={18}
                color={canAddStatement ? theme.accent : theme.textSecondary}
              />
              <Text
                style={[
                  styles.addButtonText,
                  !canAddStatement && styles.addButtonTextDisabled,
                ]}
              >
                {canAddStatement ? "Add statement" : "Maximum 7 reached"}
              </Text>
            </Pressable>

            <Text style={styles.helperCopy}>
              Every visible line and the detail must be filled before you
              create the deck.
            </Text>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <NimbusButton
              testID="create-affirmation-button"
              label={isSaving ? "Creating..." : "Create affirmation"}
              onPress={handleCreate}
              loading={isSaving}
              disabled={!canCreate || isSaving}
              textStyle={svaTypography?.textStyle.button}
              accessibilityLabel="Create affirmation"
              accessibilityHint="Submits the custom affirmation deck"
              style={styles.createButton}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenView>
  );
};

const styling = (
  theme: ColorSet,
  spacing: Spacing,
  typography: Typography,
  svaTypography?: TypographyTokens
) =>
  StyleSheet.create({
    screen: {
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
    flex: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.md,
    },
    heroCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 30,
      padding: spacing.lg,
      backgroundColor: theme.cardRaised ?? theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      shadowColor: theme.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      gap: spacing.sm,
    },
    heroGlow: {
      position: "absolute",
      top: -28,
      right: -30,
      width: 118,
      height: 118,
      borderRadius: 999,
      opacity: 0.12,
    },
    heroTitle: {
      ...(svaTypography?.textStyle.authTitle ?? {}),
      fontSize: 28,
      lineHeight: 32,
      fontStyle: "italic",
      color: theme.textPrimary,
    },
    heroSubtitle: {
      ...typography.body,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    fieldCard: {
      borderRadius: 26,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      backgroundColor: theme.surface,
      gap: spacing.sm,
    },
    fieldHeader: {
      gap: 4,
    },
    fieldLabel: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: theme.textSecondary,
    },
    fieldHint: {
      ...typography.caption,
      color: theme.textSecondary,
    },
    titleInput: {
      ...(svaTypography?.textStyle.authTitle ?? {}),
      fontSize: 28,
      lineHeight: 34,
      fontStyle: "italic",
      color: theme.textPrimary,
      paddingVertical: 0,
      minHeight: 44,
    },
    tagInput: {
      ...typography.body,
      color: theme.textPrimary,
      paddingVertical: 0,
      minHeight: 28,
      lineHeight: 22,
    },
    detailInput: {
      ...typography.body,
      color: theme.textPrimary,
      minHeight: 88,
      paddingVertical: 0,
      lineHeight: 22,
    },
    sectionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    sectionEyebrow: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 2.4,
      color: theme.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    sectionTitle: {
      ...typography.h3,
      color: theme.textPrimary,
      lineHeight: 24,
    },
    statementStack: {
      gap: spacing.sm,
    },
    statementCard: {
      borderRadius: 26,
      padding: spacing.md,
      borderWidth: 1,
      backgroundColor: theme.surface,
      gap: spacing.sm,
      shadowColor: theme.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    statementHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    statementIndexPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statementIndexText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.smallCaption.fontFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      color: theme.textPrimary,
    },
    statementHint: {
      ...typography.smallCaption,
      color: theme.textSecondary,
    },
    statementInput: {
      ...typography.body,
      color: theme.textPrimary,
      minHeight: 92,
      textAlignVertical: "top",
      paddingTop: 4,
      lineHeight: 22,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(163, 190, 140, 0.24)",
      backgroundColor: "rgba(163, 190, 140, 0.08)",
      marginTop: spacing.xs,
    },
    addButtonDisabled: {
      borderColor: theme.borderMuted ?? "rgba(255,255,255,0.08)",
      backgroundColor: theme.surfaceMuted,
      opacity: 0.7,
    },
    addButtonPressed: {
      transform: [{ scale: 0.99 }],
    },
    addButtonText: {
      fontFamily:
        svaTypography?.textStyle.authTinyLabel.fontFamily ??
        typography.button.fontFamily ??
        typography.body.fontFamily,
      fontSize: 12,
      lineHeight: 14,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: theme.accent,
    },
    addButtonTextDisabled: {
      color: theme.textSecondary,
    },
    helperCopy: {
      ...typography.caption,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
    footer: {
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    createButton: {
      alignSelf: "stretch",
    },
  });

export default CreateAffirmationScreen;
