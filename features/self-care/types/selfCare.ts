import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type SelfCareIconName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

export type SelfCareActionTile = {
  label: string;
  description: string;
  icon: SelfCareIconName;
  route: string;
  navigationMode?: "push" | "navigate";
};

export type SelfCareSectionConfig = {
  eyebrow: string;
  title: string;
  actions: SelfCareActionTile[];
};

export type SelfCareFonts = {
  serif: string;
  mono: string;
  action: string;
};
