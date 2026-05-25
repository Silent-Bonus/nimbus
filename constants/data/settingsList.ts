import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type SettingsActionType = "screen" | "modal" | "toggle" | "external";

export type SettingsRowConfig = {
  id: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  action: SettingsActionType;
  showChevron?: boolean;
  showExternal?: boolean;
  showDot?: boolean;
  danger?: boolean;
};

export type SettingsSectionConfig = {
  header: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  items: SettingsRowConfig[];
};

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    header: "Achievements & Statistics",
    icon: "trophy-outline",
    items: [
      {
        id: "overview",
        icon: "stats-chart-outline",
        action: "screen",
        label: "Overview",
        showChevron: true,
      },
      {
        id: "badges",
        icon: "medal-outline",
        action: "screen",
        label: "Badges",
        showChevron: true,
        showDot: true,
      },
    ],
  },
  {
    header: "Preferences",
    icon: "options-outline",
    items: [
      {
        id: "notification",
        icon: "notifications-outline",
        action: "modal",
        label: "Notifications",
        showChevron: true,
      },
      {
        id: "advanceSetting",
        icon: "construct-outline",
        action: "modal",
        label: "Advanced Settings",
        showChevron: true,
      },
      {
        id: "soundEffect",
        icon: "musical-notes-outline",
        action: "toggle",
        label: "Sound Effects",
      },
      {
        id: "navigation",
        icon: "location-outline",
        action: "toggle",
        label: "Location Services",
      },
    ],
  },
  {
    header: "Account",
    icon: "person-outline",
    items: [
      {
        id: "edit",
        icon: "person-circle-outline",
        action: "modal",
        label: "Profile Info",
        showChevron: true,
      },
      {
        id: "chngPass",
        icon: "lock-closed-outline",
        action: "modal",
        label: "Change Password",
        showChevron: true,
      },
      {
        id: "logout",
        icon: "exit-outline",
        action: "modal",
        label: "Logout",
        showChevron: false,
        danger: true,
      },
    ],
  },
  {
    header: "Social Media",
    icon: "share-social-outline",
    items: [
      {
        id: "discord",
        icon: "chatbubbles-outline",
        action: "external",
        label: "Discord Community",
        showExternal: true,
      },
      {
        id: "instagram",
        icon: "camera-outline",
        action: "external",
        label: "Instagram",
        showExternal: true,
      },
      {
        id: "facebook",
        icon: "logo-facebook",
        action: "external",
        label: "Facebook",
        showExternal: true,
      },
    ],
  },
  {
    header: "Help & Feedback",
    icon: "help-circle-outline",
    items: [
      {
        id: "helpCenter",
        icon: "help-circle-outline",
        action: "modal",
        label: "Help Center",
        showChevron: true,
      },
      {
        id: "contactUs",
        icon: "chatbubble-ellipses-outline",
        action: "modal",
        label: "Contact Us",
        showChevron: true,
      },
      {
        id: "privacyPolicy",
        icon: "shield-checkmark-outline",
        action: "modal",
        label: "Privacy Policy",
        showChevron: true,
      },
      {
        id: "terms",
        icon: "document-text-outline",
        action: "modal",
        label: "Terms of Service",
        showChevron: true,
      },
    ],
  },
];
