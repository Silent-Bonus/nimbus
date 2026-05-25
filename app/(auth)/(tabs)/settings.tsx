import React, { useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ThemeContext from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { SETTINGS_SECTIONS } from "@/constants/data/settingsList";
import { SETTINGS_LAYOUT } from "@/features/settings/settingsLayout";
import SettingsScreenHeader from "@/features/settings/components/SettingsScreenHeader";
import ProfileHeader from "@/features/settings/components/ProfileHeader";
import SettingsSectionCard from "@/features/settings/components/SettingsSectionCard";
import SettingsRow from "@/features/settings/components/SettingsRow";
import SettingsToggle from "@/features/settings/components/SettingsToggle";
import SettingsFooter from "@/features/settings/components/SettingsFooter";

import ContactUsModal from "@/features/settings/components/modal/ContactUsModal";
import FeedbackModal from "@/features/settings/components/modal/Feeback";
import PrivacyPolicyModal from "@/features/settings/components/modal/PrivacyPoilcy";
import TermsModal from "@/features/settings/components/modal/TermsAndService";
import FAQModal from "@/features/settings/components/modal/HelpCenter";
import ChangePasswordModal from "@/features/settings/components/modal/ChangePassword";
import LogoutModal from "@/features/settings/components/modal/LogoutModal";
import SocialActionModal from "@/features/settings/components/modal/SocialActionModal";
import EditProfileModal from "@/features/settings/components/modal/EditProfileModal";

type ToggleKey = "soundEffect" | "navigation";

type ToggleState = Record<ToggleKey, boolean>;

const INITIAL_TOGGLE_STATE: ToggleState = {
  soundEffect: true,
  navigation: false,
};

const SVA_SOCIAL_DEEP_LINK = "instagram://user?username=sva_app";
const SVA_SOCIAL_WEB_URL = "https://instagram.com/sva_app";

export default function SettingsScreen() {
  const { toggleTheme, newTheme } = useContext(ThemeContext);
  const { onLogout, userProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [toggleState, setToggleState] = useState<ToggleState>(
    INITIAL_TOGGLE_STATE
  );
  const [loc, setLoc] = useState<Location.LocationObject | null>(null);

  const [showReportBugModal, setShowReportBugModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showPrivatePolicyModal, setShowPrivatePrivacyModal] =
    useState(false);
  const [showTermsAndServiceModal, setShowTermsAndServiceModal] =
    useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showEditProfile, setEditProfile] = useState(false);

  const displayName = useMemo(() => {
    const first = userProfile?.first_name?.trim() ?? "";
    const last = userProfile?.last_name?.trim() ?? "";
    const full = `${first} ${last}`.trim();
    return (
      userProfile?.full_name?.trim() ||
      full ||
      userProfile?.username ||
      "Nimbus Member"
    );
  }, [userProfile]);

  const statusLine = useMemo(() => {
    const handle = userProfile?.username?.trim();
    return `#${handle || "321be4"} glow active`;
  }, [userProfile]);

  useEffect(() => {
    if (!loc) return;

    const fetchAddress = async () => {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          console.log(
            `${place.name}, ${place.city}, ${place.region}, ${place.country}`
          );
        }
      } catch (error) {
        console.warn("Reverse geocode failed", error);
      }
    };

    fetchAddress();
  }, [loc]);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied :: Location permission is required.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    setLoc(location);
  }

  const onLogoutClick = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  const switchEnableHandler = async (id: ToggleKey) => {
    try {
      if (id === "navigation") {
        await requestLocation();
      } else if (id === "soundEffect") {
        console.log("Enable sound effects");
      }
    } catch (err) {
      console.warn("switchEnableHandler error", err);
      setToggleState((prev) => ({ ...prev, [id]: false }));
    }
  };

  const switchDisableHandler = async (id: ToggleKey) => {
    try {
      if (id === "navigation") {
        setLoc(null);
      } else if (id === "soundEffect") {
        console.log("Disable sound effects");
      }
    } catch (err) {
      console.warn("switchDisableHandler error", err);
      setToggleState((prev) => ({ ...prev, [id]: true }));
    }
  };

  const onToggle = async (id: ToggleKey, value: boolean) => {
    await (value ? switchEnableHandler(id) : switchDisableHandler(id));
    setToggleState((prev) => ({ ...prev, [id]: value }));
    toggleTheme(value ? "dark" : "light");
  };

  const handleAction = (id: string) => {
    switch (id) {
      case "overview":
        router.push("/(auth)/statistics/details");
        break;
      case "badges":
        router.push("/(auth)/rewards");
        break;
      case "notification":
        router.push(ROUTES.AUTH.NOTIFICATIONS);
        break;
      case "advanceSetting":
        router.push(ROUTES.AUTH.ADVANCED_SETTINGS);
        break;
      case "edit":
        setEditProfile(true);
        break;
      case "chngPass":
        setShowChangePasswordModal(true);
        break;
      case "logout":
        setShowLogoutModal(true);
        break;
      case "discord":
      case "instagram":
      case "facebook":
        setShowSocialModal(true);
        break;
      case "helpCenter":
        setShowFAQModal(true);
        break;
      case "contactUs":
        setShowReportBugModal(true);
        break;
      case "privacyPolicy":
        setShowPrivatePrivacyModal(true);
        break;
      case "terms":
        setShowTermsAndServiceModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: newTheme.background }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <SettingsScreenHeader
        title="Nimbus You"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 126 },
        ]}
      >
        <ProfileHeader
          username={userProfile?.username || "321be4"}
          displayName={displayName}
          avatarUrl={userProfile?.avatar || null}
          planLabel="PREMIUM MEMBER"
          badgeLabel="PREMIUM MEMBER"
          statusLine={statusLine}
          onPressManagePlan={() => router.push(ROUTES.AUTH.BILLING_UPGRADE)}
        />

        <View style={styles.sectionStack}>
          {SETTINGS_SECTIONS.map((section) => (
            <SettingsSectionCard
              key={section.header}
              title={section.header}
              icon={section.icon}
              style={styles.sectionCard}
            >
              {section.items.map((item, index) => {
                const isToggle = item.action === "toggle";
                const isLast = index === section.items.length - 1;
                const rowStyle = isLast ? undefined : styles.rowSpacing;

                if (isToggle) {
                  const toggleKey = item.id as ToggleKey;

                  return (
                    <SettingsRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      style={rowStyle}
                      rightSlot={
                        <SettingsToggle
                          value={toggleState[toggleKey]}
                          onValueChange={(next) => onToggle(toggleKey, next)}
                        />
                      }
                    />
                  );
                }

                return (
                  <SettingsRow
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    danger={item.danger}
                    showChevron={item.showChevron}
                    showExternal={item.showExternal}
                    showDot={item.showDot}
                    style={rowStyle}
                    onPress={() => handleAction(item.id)}
                  />
                );
              })}
            </SettingsSectionCard>
          ))}
        </View>

        <SettingsFooter />
      </ScrollView>

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setEditProfile(false)}
        onSaved={() => setEditProfile(false)}
      />

      <ContactUsModal
        visible={showReportBugModal}
        onClose={() => setShowReportBugModal(false)}
      />

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <PrivacyPolicyModal
        visible={showPrivatePolicyModal}
        onClose={() => setShowPrivatePrivacyModal(false)}
      />

      <TermsModal
        visible={showTermsAndServiceModal}
        onClose={() => setShowTermsAndServiceModal(false)}
      />

      <FAQModal
        visible={showFAQModal}
        onClose={() => setShowFAQModal(false)}
      />

      <SocialActionModal
        visible={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        title="SVA Social"
        appDeepLink={SVA_SOCIAL_DEEP_LINK}
        webUrl={SVA_SOCIAL_WEB_URL}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <LogoutModal
        visible={showLogoutModal}
        onLogout={onLogoutClick}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SETTINGS_LAYOUT.screenHorizontal,
    paddingTop: SETTINGS_LAYOUT.screenTop,
  },
  sectionStack: {
    marginTop: 8,
    gap: SETTINGS_LAYOUT.sectionGap,
  },
  sectionCard: {
    marginTop: 0,
  },
  rowSpacing: {
    marginBottom: 4,
  },
});
