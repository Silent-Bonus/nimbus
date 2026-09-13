/** Identifies the fixed blueprint cards shown on the home screen. */
export type BlueprintKey = "water" | "sleep" | "meditation";

export type BlueprintLayout = "compact" | "wide";

export type BlueprintIcon = "water-outline" | "moon-outline" | "leaf-outline";

export type CheckInRoute =
  | "/(auth)/check-in/water"
  | "/(auth)/check-in/sleep"
  | "/(auth)/check-in/meditation"
  | "/(auth)/check-in/meditation-anchor";

/** Normalized check-in data used by the blueprint cards. */
export type LoadedCheckin = {
  id: number;
  name: string;
  goalQuantity: number;
  completedQuantity: number;
  unit: string;
  route: CheckInRoute;
  completed: boolean;
};

/** Static content and theme values for one blueprint card. */
export type BlueprintTemplate = {
  key: BlueprintKey;
  title: string;
  kicker: string;
  icon: BlueprintIcon;
  route: CheckInRoute;
  accent: string;
  gradientEnd: string;
  tint: string;
  previewMetric: string;
  previewProgress: number;
  searchTerms: string[];
  layout: BlueprintLayout;
};

/** Render-ready card combining a template with optional live check-in data. */
export type BlueprintCard = BlueprintTemplate & {
  item?: LoadedCheckin;
  progress: number;
  metric: string;
  disabled: boolean;
};

export type BiometricBlueprintPanelProps = {
  date: string;
};

export type DailyCheckinProtocolDetails = {
  habit_id: number;
  habit_name: string;
  template_name: string;
  metric_unit: string;
  metric_count: number;
};

export type DailyCheckinGoalDetails = {
  target: number;
  completed: number;
  completion_percentage: number;
  remaining: number;
  unit: string;
  description: string;
};

/** Template-ready shape used when rendering the daily check-in list. */
export type TransformedDailyCheckin = {
  id: number;
  name: string;
  target_unit: number;
  completed_unit: number;
  completion_percentage: number;
  daily_checkin: {
    protocol_details: DailyCheckinProtocolDetails;
    goal_details: DailyCheckinGoalDetails;
    tips: string[];
    interesting_text: string;
  };
};
