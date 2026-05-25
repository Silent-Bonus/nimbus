import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SvgUri } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNimbusToast } from "@/components/ui/toast/useNimbusToast";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { svgIndexToFileUri } from "../../constants/builtinAvatars";
import AvatarBusy from "@/assets/images/avatar/busyguy.svg";
import AvatarCoolFemale from "@/assets/images/avatar/coolfemale.svg";
import AvatarCoolGuy from "@/assets/images/avatar/coolguy.svg";
import AvatarYoungGuy from "@/assets/images/avatar/youngguy.svg";
import AvatarSeriousFemale from "@/assets/images/avatar/seriousfemale.svg";
import AvatarFitnessFemale from "@/assets/images/avatar/fitnessfemale.svg";
import AvatarFinanceGuy from "@/assets/images/avatar/financeguy.svg";
import AvatarDeveloperGuy from "@/assets/images/avatar/developerguy.svg";
import AvatarFemale from "@/assets/images/avatar/female.svg";
import type { SvaColorSet, Spacing } from "@/theme/types";

type AvatarKey = string | null;

type EditProfileProfileData = {
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  phone_number?: string | null;
};

type EditProfileSettingsData = {
  height_unit?: string | null;
  weight_unit?: string | null;
};

type EditProfileUser = {
  id?: string | number;
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: AvatarKey;
  profile?: EditProfileProfileData | null;
  settings?: EditProfileSettingsData | null;
};

type EditProfilePayload = {
  first_name?: string;
  last_name?: string;
  profile?: EditProfileProfileData;
  settings?: EditProfileSettingsData;
};

type EditProfileTypography = {
  titleFamily: string;
  bodyFamily: string;
  bodyStrongFamily: string;
  monoFamily: string;
};

type EditProfileStyles = ReturnType<typeof createStyles>;

type FocusField = "firstName" | "lastName" | "age" | "height" | "weight" | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: (updatedUser?: EditProfileUser) => void;
};

type AvatarComponent = React.ComponentType<{ width?: string | number; height?: string | number }>;

type ProfileFieldProps = {
  fieldKey: Exclude<FocusField, null>;
  label: string;
  value: string;
  placeholder: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  textContentType?: React.ComponentProps<typeof TextInput>["textContentType"];
  onChangeText: (text: string) => void;
  focusedField: FocusField;
  setFocusedField: React.Dispatch<React.SetStateAction<FocusField>>;
  colors: SvaColorSet;
  styles: EditProfileStyles;
};

type ReadOnlyRowProps = {
  label: string;
  value: string;
  styles: EditProfileStyles;
};

type UnitChipGroupProps = {
  label: string;
  value: string;
  options: string[];
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onChange: (value: string) => void;
  colors: SvaColorSet;
  fonts: EditProfileTypography;
  styles: EditProfileStyles;
};

type AvatarPreviewProps = {
  avatarKey: AvatarKey;
  initials: string;
  styles: EditProfileStyles;
};

const BUILTIN_SVGS: AvatarComponent[] = [
  AvatarBusy,
  AvatarCoolFemale,
  AvatarCoolGuy,
  AvatarYoungGuy,
  AvatarSeriousFemale,
  AvatarFitnessFemale,
  AvatarFinanceGuy,
  AvatarDeveloperGuy,
  AvatarFemale,
];

export const BUILTIN_AVATAR_FILES: Record<number, unknown> = {
  0: require("@/assets/images/avatar/busyguy.svg"),
  1: require("@/assets/images/avatar/coolfemale.svg"),
  2: require("@/assets/images/avatar/coolguy.svg"),
  3: require("@/assets/images/avatar/youngguy.svg"),
  4: require("@/assets/images/avatar/seriousfemale.svg"),
  5: require("@/assets/images/avatar/fitnessfemale.svg"),
  6: require("@/assets/images/avatar/financeguy.svg"),
  7: require("@/assets/images/avatar/developerguy.svg"),
  8: require("@/assets/images/avatar/female.svg"),
};

function isSvgUrl(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".svg") || clean.includes(".svg/");
}

function getInitials(firstName: string, lastName: string, fallback: string) {
  const composed = `${firstName} ${lastName}`.trim();
  const parts = composed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  if (parts) return parts;

  const fallbackParts = fallback
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return fallbackParts || "SV";
}

async function buildProfileFormData(
  payload: EditProfilePayload,
  avatarKey: AvatarKey
) {
  const fd = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });

  if (avatarKey?.startsWith("svg:")) {
    const idx = Number(avatarKey.split(":")[1]);
    const uri = await svgIndexToFileUri(idx);

    fd.append(
      "avatar",
      {
        uri,
        name: `avatar-${idx}.svg`,
        type: "image/svg+xml",
      } as any
    );
  } else if (avatarKey?.startsWith("uri:")) {
    const uri = avatarKey.slice(4);
    const isSvg = isSvgUrl(uri);

    fd.append(
      "avatar",
      {
        uri,
        name: isSvg ? "avatar.svg" : "avatar.jpg",
        type: isSvg ? "image/svg+xml" : "image/jpeg",
      } as any
    );
  }

  return fd;
}

function AvatarPreview({ avatarKey, initials, styles }: AvatarPreviewProps) {
  if (!avatarKey) {
    return <Text style={styles.avatarInitials}>{initials}</Text>;
  }

  if (avatarKey.startsWith("svg:")) {
    const idx = Number(avatarKey.split(":")[1]);
    const SvgComp = BUILTIN_SVGS[idx];

    if (SvgComp) {
      return (
        <View style={styles.avatarImageWrap}>
          <SvgComp width="100%" height="100%" />
        </View>
      );
    }
  }

  const maybeUri = avatarKey.startsWith("uri:") ? avatarKey.slice(4) : avatarKey;

  if (typeof maybeUri === "string" && isSvgUrl(maybeUri)) {
    return (
      <View style={styles.avatarImageWrap}>
        <SvgUri uri={maybeUri} width="100%" height="100%" />
      </View>
    );
  }

  return <Image source={{ uri: maybeUri }} style={styles.avatarImage} />;
}

function ProfileField({
  fieldKey,
  label,
  value,
  placeholder,
  icon,
  keyboardType = "default",
  textContentType,
  onChangeText,
  focusedField,
  setFocusedField,
  colors,
  styles,
}: ProfileFieldProps) {
  const focused = focusedField === fieldKey;

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>

      <View style={[styles.fieldShell, focused && styles.fieldShellFocused]}>
        <View style={styles.fieldIconWrap}>
          <Ionicons
            name={icon}
            size={16}
            color={focused ? colors.brand.primary : colors.text.secondary}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
          textContentType={textContentType}
          selectionColor={colors.brand.primary}
          cursorColor={colors.brand.primary}
          style={styles.fieldInput}
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField((current) => (current === fieldKey ? null : current))}
        />
      </View>
    </View>
  );
}

function ReadOnlyRow({ label, value, styles }: ReadOnlyRowProps) {
  return (
    <View style={styles.readRow}>
      <Text style={styles.readLabel}>{label}</Text>
      <Text style={styles.readValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function UnitChipGroup({
  label,
  value,
  options,
  icon,
  onChange,
  colors,
  fonts,
  styles,
}: UnitChipGroupProps) {
  return (
    <View style={styles.unitGroup}>
      <View style={styles.unitHeaderRow}>
        <View style={styles.unitHeaderLabelWrap}>
          <Ionicons name={icon} size={12} color={colors.text.secondary} />
          <Text style={styles.unitLabel}>{label}</Text>
        </View>
        <Text style={styles.unitValue} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <View style={styles.unitChoices}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${option}`}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.unitChip,
                active && styles.unitChipActive,
                pressed && styles.unitChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.unitChipText,
                  {
                    fontFamily:
                      fonts.monoFamily || "SpaceMono-Regular",
                  },
                  active && styles.unitChipTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  children,
  styles,
  colors,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
  styles: EditProfileStyles;
  colors: SvaColorSet;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderIconWrap}>
          <Ionicons name={icon} size={13} color={colors.brand.primary} />
        </View>
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
      </View>

      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function EditProfileModal({ visible, onClose, onSaved }: Props) {
  const { svaColors, svaTypography, typography, spacing } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { loadUserFromStorage, updateProfile } = useAuth();
  const toast = useNimbusToast();

  const [profile, setProfile] = useState<EditProfileUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(null);
  const [age, setAge] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<string>("cm");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusField>(null);

  const fonts = useMemo<EditProfileTypography>(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles: EditProfileStyles = useMemo(
    () => createStyles(svaColors, fonts, spacing, insets.top, insets.bottom),
    [svaColors, fonts, spacing, insets.top, insets.bottom]
  );

  useEffect(() => {
    if (!visible) {
      setPickerOpen(false);
      setHydrating(false);
      setSaving(false);
      setFocusedField(null);
      return;
    }

    let active = true;

    setProfile(null);
    setFirstName("");
    setLastName("");
    setAvatarKey(null);
    setAge(null);
    setHeight(null);
    setWeight(null);
    setHeightUnit("cm");
    setWeightUnit("kg");
    setFocusedField(null);
    setHydrating(true);

    (async () => {
      try {
        const cached = await loadUserFromStorage?.();
        if (!active) return;

        if (!cached) {
          return;
        }

        const nextProfile: EditProfileUser = {
          id: cached?.id,
          username: cached?.username ?? "",
          email: cached?.email ?? "",
          first_name: cached?.first_name ?? "",
          last_name: cached?.last_name ?? "",
          avatar: cached?.avatar ?? null,
          profile: cached?.profile ?? {},
          settings: cached?.settings ?? {},
        };

        setProfile(nextProfile);
        setFirstName(nextProfile.first_name ?? "");
        setLastName(nextProfile.last_name ?? "");
        setAvatarKey(nextProfile.avatar ?? null);
        setHeightUnit(nextProfile.settings?.height_unit ?? "cm");
        setWeightUnit(nextProfile.settings?.weight_unit ?? "kg");

        const rawAge = nextProfile.profile?.age;
        const rawHeight = nextProfile.profile?.height;
        const rawWeight = nextProfile.profile?.weight;

        setAge(
          typeof rawAge === "number" ? rawAge : rawAge ? Number(rawAge) : null
        );
        setHeight(
          typeof rawHeight === "number"
            ? rawHeight
            : rawHeight
            ? Number(rawHeight)
            : null
        );
        setWeight(
          typeof rawWeight === "number"
            ? rawWeight
            : rawWeight
            ? Number(rawWeight)
            : null
        );
      } catch (error) {
        console.warn("edit profile load error", error);
      } finally {
        if (active) setHydrating(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [visible, loadUserFromStorage]);

  const dirty = useMemo(() => {
    if (!profile) return false;

    const firstChanged = (profile.first_name ?? "") !== (firstName ?? "");
    const lastChanged = (profile.last_name ?? "") !== (lastName ?? "");
    const avatarChanged = (profile.avatar ?? null) !== (avatarKey ?? null);

    const origAge = profile.profile?.age ?? null;
    const origHeight = profile.profile?.height ?? null;
    const origWeight = profile.profile?.weight ?? null;

    const ageChanged = (origAge ?? null) !== (age ?? null);
    const heightChanged = (origHeight ?? null) !== (height ?? null);
    const weightChanged = (origWeight ?? null) !== (weight ?? null);

    const origHeightUnit = profile.settings?.height_unit ?? "cm";
    const origWeightUnit = profile.settings?.weight_unit ?? "kg";
    const heightUnitChanged = origHeightUnit !== heightUnit;
    const weightUnitChanged = origWeightUnit !== weightUnit;

    return (
      firstChanged ||
      lastChanged ||
      avatarChanged ||
      ageChanged ||
      heightChanged ||
      weightChanged ||
      heightUnitChanged ||
      weightUnitChanged
    );
  }, [profile, firstName, lastName, avatarKey, age, height, weight, heightUnit, weightUnit]);

  const resolvedName =
    `${firstName} ${lastName}`.trim() ||
    profile?.username?.trim() ||
    "SVA member";

  const resolvedSubtitle =
    profile?.email?.trim() ||
    profile?.profile?.phone_number?.trim() ||
    "Update your avatar and personal details across SVA.";

  const initials = useMemo(
    () =>
      getInitials(
        firstName,
        lastName,
        profile?.username ?? profile?.email ?? "SVA"
      ),
    [firstName, lastName, profile?.username, profile?.email]
  );

  const heroStatusLabel = hydrating ? "LOADING" : dirty ? "UNSAVED" : "SYNCED";

  const buildPayload = useCallback((): EditProfilePayload => {
    if (!profile) return {};

    const payload: EditProfilePayload = {};

    if ((profile.first_name ?? "") !== (firstName ?? "")) {
      payload.first_name = firstName;
    }

    if ((profile.last_name ?? "") !== (lastName ?? "")) {
      payload.last_name = lastName;
    }

    const nestedProfile: EditProfileProfileData = {};
    const originalProfile = profile.profile ?? {};

    if ((originalProfile.age ?? null) !== (age ?? null)) {
      nestedProfile.age = age ?? null;
    }

    if ((originalProfile.height ?? null) !== (height ?? null)) {
      nestedProfile.height = height ?? null;
    }

    if ((originalProfile.weight ?? null) !== (weight ?? null)) {
      nestedProfile.weight = weight ?? null;
    }

    if (Object.keys(nestedProfile).length > 0) {
      payload.profile = { ...(profile.profile ?? {}), ...nestedProfile };
    }

    const nestedSettings: EditProfileSettingsData = {};
    const originalSettings = profile.settings ?? {};

    if ((originalSettings.height_unit ?? "cm") !== heightUnit) {
      nestedSettings.height_unit = heightUnit;
    }

    if ((originalSettings.weight_unit ?? "kg") !== weightUnit) {
      nestedSettings.weight_unit = weightUnit;
    }

    if (Object.keys(nestedSettings).length > 0) {
      payload.settings = { ...(profile.settings ?? {}), ...nestedSettings };
    }

    return payload;
  }, [profile, firstName, lastName, age, height, weight, heightUnit, weightUnit]);

  const handleCancel = useCallback(() => {
    if (saving) return;

    if (dirty) {
      Alert.alert(
        "Discard changes?",
        "You have unsaved profile changes. Discard them?",
        [
          { text: "Keep editing", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: onClose },
        ]
      );
      return;
    }

    onClose();
  }, [dirty, onClose, saving]);

  const handleSave = useCallback(async () => {
    if (!profile || !dirty || saving || hydrating) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      const fd = await buildProfileFormData(payload, avatarKey);
      const saved = await updateProfile?.(fd);

      if (saved?.success) {
        toast.show({
          variant: "success",
          title: "Profile updated",
          message: "Your SVA profile was updated successfully.",
        });
        setPickerOpen(false);
        onClose();
        onSaved?.(saved?.data);
      } else {
        Alert.alert("Update failed", saved?.message ?? "Try again.");
      }
    } catch (error) {
      console.warn("save profile error", error);
      Alert.alert("Error", "Unable to save profile. Try again.");
    } finally {
      setSaving(false);
    }
  }, [avatarKey, buildPayload, dirty, hydrating, onClose, onSaved, profile, saving, toast, updateProfile]);

  const onChangeAge = useCallback((txt: string) => {
    const next = txt === "" ? null : Number(txt);
    setAge(Number.isNaN(next) ? null : next);
  }, []);

  const onChangeHeight = useCallback((txt: string) => {
    const next = txt === "" ? null : Number(txt);
    setHeight(Number.isNaN(next) ? null : next);
  }, []);

  const onChangeWeight = useCallback((txt: string) => {
    const next = txt === "" ? null : Number(txt);
    setWeight(Number.isNaN(next) ? null : next);
  }, []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <View style={styles.screen}>
        <ScreenHeader
          title="Edit profile"
          subtitle="Avatar, personal details, and body metrics"
          onBack={handleCancel}
          containerStyle={styles.header}
        />

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={[
                svaColors.surface.raised,
                svaColors.surface.base,
                svaColors.surface.base,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroGlowOne} />
              <View style={styles.heroGlowTwo} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={svaColors.brand.primary}
                  />
                  <Text style={styles.heroBadgeText}>SVA profile</Text>
                </View>

                <View
                  style={[
                    styles.heroStatusPill,
                    dirty && styles.heroStatusPillDirty,
                    hydrating && styles.heroStatusPillLoading,
                  ]}
                >
                  <Text style={styles.heroStatusText}>{heroStatusLabel}</Text>
                </View>
              </View>

              <View style={styles.heroBodyRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change avatar"
                  onPress={() => setPickerOpen(true)}
                  style={({ pressed }) => [
                    styles.avatarPressable,
                    pressed && styles.avatarPressablePressed,
                  ]}
                >
                  <View style={styles.avatarHalo} />
                  <View style={styles.avatarRing}>
                    <View style={styles.avatarInner}>
                      <AvatarPreview
                        avatarKey={avatarKey}
                        initials={initials}
                        styles={styles}
                      />
                    </View>
                  </View>
                  <View style={styles.avatarEditBadge}>
                    <Ionicons
                      name="pencil"
                      size={12}
                      color={svaColors.bg.base}
                    />
                  </View>
                </Pressable>

                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle} numberOfLines={1}>
                    {resolvedName}
                  </Text>
                  <Text style={styles.heroText} numberOfLines={2}>
                    {resolvedSubtitle}
                  </Text>
                  <Text style={styles.heroFootnote}>
                    Tap the avatar to open the picker. Changes save back to the
                    same SVA profile.
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <SectionCard
              title="Account"
              icon="person-outline"
              styles={styles}
              colors={svaColors}
            >
              <ReadOnlyRow
                label="Username"
                value={profile?.username?.trim() || "Not set"}
                styles={styles}
              />
              <ReadOnlyRow
                label="Email"
                value={profile?.email?.trim() || "Not set"}
                styles={styles}
              />
              <ReadOnlyRow
                label="Phone"
                value={profile?.profile?.phone_number?.trim() || "Not provided"}
                styles={styles}
              />
            </SectionCard>

            <SectionCard
              title="Personal details"
              icon="fitness-outline"
              styles={styles}
              colors={svaColors}
            >
              <ProfileField
                fieldKey="firstName"
                label="First name"
                value={firstName}
                placeholder="First name"
                icon="id-card-outline"
                onChangeText={setFirstName}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                colors={svaColors}
                styles={styles}
                textContentType="givenName"
              />

              <ProfileField
                fieldKey="lastName"
                label="Last name"
                value={lastName}
                placeholder="Last name"
                icon="id-card-outline"
                onChangeText={setLastName}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                colors={svaColors}
                styles={styles}
                textContentType="familyName"
              />

              <View style={styles.doubleRow}>
                <View style={styles.doubleRowItem}>
                  <ProfileField
                    fieldKey="age"
                    label="Age"
                    value={age !== null ? String(age) : ""}
                    placeholder="Age"
                    icon="calendar-outline"
                    keyboardType="numeric"
                    onChangeText={onChangeAge}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    colors={svaColors}
                    styles={styles}
                    textContentType="none"
                  />
                </View>

                <View style={styles.doubleRowItem}>
                  <ProfileField
                    fieldKey="height"
                    label="Height"
                    value={height !== null ? String(height) : ""}
                    placeholder="Height"
                    icon="resize-outline"
                    keyboardType="numeric"
                    onChangeText={onChangeHeight}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    colors={svaColors}
                    styles={styles}
                    textContentType="none"
                  />
                </View>
              </View>

              <ProfileField
                fieldKey="weight"
                label="Weight"
                value={weight !== null ? String(weight) : ""}
                placeholder="Weight"
                icon="barbell-outline"
                keyboardType="numeric"
                onChangeText={onChangeWeight}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                colors={svaColors}
                styles={styles}
                textContentType="none"
              />

              <UnitChipGroup
                label="Height unit"
                value={heightUnit}
                options={["cm", "in"]}
                icon="swap-horizontal-outline"
                onChange={setHeightUnit}
                colors={svaColors}
                fonts={fonts}
                styles={styles}
              />

              <UnitChipGroup
                label="Weight unit"
                value={weightUnit}
                options={["kg", "lbs"]}
                icon="swap-horizontal-outline"
                onChange={setWeightUnit}
                colors={svaColors}
                fonts={fonts}
                styles={styles}
              />
            </SectionCard>
          </ScrollView>

          <View
            style={[
              styles.footer,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel profile changes"
              onPress={handleCancel}
              disabled={saving}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !saving && styles.secondaryButtonPressed,
                saving && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
              onPress={handleSave}
              disabled={!dirty || saving || hydrating}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !saving && !hydrating && styles.primaryButtonPressed,
                (!dirty || saving || hydrating) && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Save profile"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={pickerOpen}
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setPickerOpen(false)}
        >
          <AvatarPickerModal
            visible={pickerOpen}
            initial={avatarKey}
            onClose={() => setPickerOpen(false)}
            onSelect={setAvatarKey}
          />
        </Modal>
      </View>
    </Modal>
  );
}

function AvatarPickerModal({
  visible,
  initial = null,
  onClose,
  onSelect,
}: {
  visible: boolean;
  initial?: AvatarKey;
  onClose: () => void;
  onSelect: (key: AvatarKey) => void;
}) {
  const { svaColors, svaTypography, typography, spacing } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<AvatarKey>(initial ?? null);

  const fonts = useMemo(
    () => ({
      titleFamily:
        svaTypography?.textStyle.authTitle.fontFamily ??
        typography.h2.fontFamily ??
        "CormorantGaramond_500Medium",
      bodyFamily:
        svaTypography?.textStyle.body.fontFamily ??
        typography.body.fontFamily ??
        "Outfit_400Regular",
      bodyStrongFamily:
        svaTypography?.textStyle.bodyMedium.fontFamily ??
        typography.bodyStrong.fontFamily ??
        "Outfit_600SemiBold",
      monoFamily:
        svaTypography?.textStyle.authMonoLabel.fontFamily ??
        "SpaceMono-Regular",
    }),
    [svaTypography, typography]
  );

  const styles = useMemo(
    () =>
      createAvatarPickerStyles(svaColors, fonts, spacing, insets.top, insets.bottom),
    [svaColors, fonts, spacing, insets.top, insets.bottom]
  );

  useEffect(() => {
    if (visible) {
      setSelectedId(initial ?? null);
    }
  }, [visible, initial]);

  const items = useMemo(
    () =>
      BUILTIN_SVGS.map((SvgComp, index) => ({
        id: `svg:${index}`,
        kind: "svg" as const,
        svg: SvgComp,
      })),
    []
  );

  const handleReset = () => setSelectedId(null);

  const handleSave = () => {
    onSelect(selectedId);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Choose avatar"
        subtitle="Pick a built-in avatar or keep the uploaded image"
        onBack={onClose}
        containerStyle={styles.header}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryIconWrap}>
          <Ionicons name="person-circle-outline" size={18} color={svaColors.brand.primary} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Built-in avatars</Text>
          <Text style={styles.summaryText}>
            Choose a clean identity marker for your SVA profile and tap save to
            apply it.
          </Text>
        </View>
      </View>

      <View style={styles.gridWrap}>
        <ScrollView
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.grid}>
            {items.map((item) => {
              const active = selectedId === item.id;
              const SvgComp = item.svg;

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select avatar ${item.id}`}
                  onPress={() => setSelectedId(item.id)}
                  style={({ pressed }) => [
                    styles.avatarCard,
                    active && styles.avatarCardActive,
                    pressed && styles.avatarCardPressed,
                  ]}
                >
                  <View style={styles.avatarCardInner}>
                    <SvgComp width="100%" height="100%" />
                  </View>

                  {active ? (
                    <View style={styles.checkBadge}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={svaColors.bg.base}
                      />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

          <View
            style={styles.footer}
          >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset avatar selection"
          onPress={handleReset}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save avatar selection"
          onPress={handleSave}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Save avatar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(
  colors: SvaColorSet,
  fonts: EditProfileTypography,
  spacing: Spacing,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
      paddingTop: topInset + spacing.sm,
      paddingHorizontal: spacing.md,
    },
    header: {
      marginBottom: spacing.sm,
    },
    body: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    heroCard: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      padding: 18,
      minHeight: 220,
      backgroundColor: colors.surface.base,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroGlowOne: {
      position: "absolute",
      top: -30,
      right: -26,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.brand.primary,
      opacity: 0.08,
    },
    heroGlowTwo: {
      position: "absolute",
      bottom: -34,
      left: -24,
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor: colors.overlay.light,
      opacity: 0.8,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    heroBadgeText: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    heroStatusPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.raised,
    },
    heroStatusPillDirty: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.subtle,
    },
    heroStatusPillLoading: {
      borderColor: colors.border.muted,
      backgroundColor: colors.surface.base,
    },
    heroStatusText: {
      fontFamily: fonts.monoFamily,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: colors.text.secondary,
    },
    heroBodyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    avatarPressable: {
      width: 112,
      height: 112,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    avatarPressablePressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }],
    },
    avatarHalo: {
      position: "absolute",
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: colors.interaction.selected,
    },
    avatarRing: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      padding: 2,
      overflow: "hidden",
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.28,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    avatarInner: {
      flex: 1,
      borderRadius: 44,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.base,
    },
    avatarImageWrap: {
      width: "100%",
      height: "100%",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarInitials: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 23,
      lineHeight: 24,
      color: colors.text.primary,
      letterSpacing: 0.4,
    },
    avatarEditBadge: {
      position: "absolute",
      right: 0,
      bottom: 4,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
      borderWidth: 2,
      borderColor: colors.bg.base,
    },
    heroCopy: {
      flex: 1,
      paddingRight: 4,
    },
    heroTitle: {
      fontFamily: fonts.titleFamily,
      color: colors.text.primary,
      fontSize: 27,
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    heroText: {
      marginTop: 6,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 13.5,
      lineHeight: 19,
    },
    heroFootnote: {
      marginTop: 8,
      fontFamily: fonts.monoFamily,
      color: colors.text.disabled,
      fontSize: 9.5,
      lineHeight: 13,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    sectionCard: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: 16,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: spacing.md,
    },
    sectionHeaderIconWrap: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    sectionHeaderTitle: {
      fontFamily: fonts.bodyStrongFamily,
      fontSize: 14,
      lineHeight: 18,
      color: colors.text.primary,
      letterSpacing: 0.2,
      textTransform: "none",
    },
    sectionBody: {
      gap: spacing.md,
    },
    readRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    readLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.secondary,
      fontSize: 13,
      lineHeight: 18,
    },
    readValue: {
      flex: 1,
      textAlign: "right",
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 13.5,
      lineHeight: 18,
    },
    fieldGroup: {
      gap: 8,
    },
    fieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    fieldLabel: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 13,
      lineHeight: 18,
    },
    fieldShell: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 18,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingHorizontal: 14,
      minHeight: 56,
    },
    fieldShellFocused: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.interaction.selected,
    },
    fieldIconWrap: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    fieldInput: {
      flex: 1,
      color: colors.text.primary,
      fontFamily: fonts.bodyFamily,
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 0,
    },
    doubleRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    doubleRowItem: {
      flex: 1,
    },
    unitGroup: {
      gap: 8,
    },
    unitHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    unitHeaderLabelWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    unitLabel: {
      fontFamily: fonts.monoFamily,
      color: colors.text.secondary,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    unitValue: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.secondary,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    unitChoices: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    unitChip: {
      minWidth: 62,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    unitChipActive: {
      backgroundColor: colors.brand.subtle,
      borderColor: colors.brand.primary,
    },
    unitChipPressed: {
      opacity: 0.88,
    },
    unitChipText: {
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: colors.text.secondary,
    },
    unitChipTextActive: {
      color: colors.brand.primary,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border.muted,
      paddingTop: spacing.md,
      paddingBottom: bottomInset + spacing.md,
      gap: 10,
      backgroundColor: colors.bg.base,
      marginTop: spacing.sm,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: colors.brand.primary,
      borderWidth: 1,
      borderColor: colors.brand.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.brand.primaryPressed,
      borderColor: colors.brand.primaryPressed,
    },
    secondaryButton: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    secondaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    primaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.bg.base,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: 14,
      marginBottom: spacing.md,
    },
    summaryIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14,
      lineHeight: 18,
    },
    summaryText: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    gridWrap: {
      flex: 1,
    },
    gridContent: {
      paddingBottom: bottomInset + spacing.md,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: spacing.md,
    },
    avatarCard: {
      width: "31.5%",
      aspectRatio: 1,
      borderRadius: 20,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    },
    avatarCardActive: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.subtle,
    },
    avatarCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    avatarCardInner: {
      width: "100%",
      height: "100%",
      padding: 10,
    },
    checkBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
      borderWidth: 2,
      borderColor: colors.bg.base,
    },
  });
}

function createAvatarPickerStyles(
  colors: SvaColorSet,
  fonts: EditProfileTypography,
  spacing: Spacing,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg.base,
      paddingHorizontal: spacing.md,
      paddingTop: topInset + spacing.sm,
    },
    header: {
      marginBottom: spacing.sm,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.base,
      padding: 14,
      marginBottom: spacing.md,
      shadowColor: colors.shadow.default,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    summaryIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    summaryCopy: {
      flex: 1,
    },
    summaryTitle: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 14,
      lineHeight: 18,
    },
    summaryText: {
      marginTop: 4,
      fontFamily: fonts.bodyFamily,
      color: colors.text.secondary,
      fontSize: 12.5,
      lineHeight: 17,
    },
    gridWrap: {
      flex: 1,
    },
    gridContent: {
      paddingBottom: bottomInset + spacing.md,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: spacing.md,
    },
    avatarCard: {
      width: "31.5%",
      aspectRatio: 1,
      borderRadius: 20,
      backgroundColor: colors.surface.base,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    },
    avatarCardActive: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.subtle,
    },
    avatarCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    avatarCardInner: {
      width: "100%",
      height: "100%",
      padding: 10,
    },
    checkBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brand.primary,
      borderWidth: 2,
      borderColor: colors.bg.base,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border.muted,
      paddingTop: spacing.md,
      paddingBottom: bottomInset + spacing.md,
      gap: 10,
      backgroundColor: colors.bg.base,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: colors.brand.primary,
      borderWidth: 1,
      borderColor: colors.brand.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.brand.primaryPressed,
      borderColor: colors.brand.primaryPressed,
    },
    secondaryButton: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: colors.surface.raised,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.interaction.hover,
    },
    secondaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    primaryButtonText: {
      fontFamily: fonts.bodyStrongFamily,
      color: colors.bg.base,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
  });
}
