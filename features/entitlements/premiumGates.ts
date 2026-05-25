import { ROUTES } from "@/constants/routes";
import type { UserProfile } from "@/features/auth/types/userProfile";
import { hasPremiumAccess } from "@/features/auth/utils/userEntitlements";

export type PremiumGateFeatureKey =
  | "curated_manifest_detail"
  | "curated_manifest_protocols";

export type PremiumGateMode = "preview" | "locked";
export type PremiumGateState = "allowed" | PremiumGateMode;
export type PremiumGateSource =
  | "screen_entry"
  | "cta_press"
  | "card_tap"
  | "row_tap";

export type PremiumGateConfig = {
  featureKey: PremiumGateFeatureKey;
  mode: PremiumGateMode;
  title: string;
  subtitle: string;
  highlights: string[];
  primaryLabel: string;
  secondaryLabel: string;
  upgradeRoute: (typeof ROUTES)["AUTH"]["BILLING_UPGRADE"];
};

export const PREMIUM_GATE_CONFIG: Record<PremiumGateFeatureKey, PremiumGateConfig> =
  {
    curated_manifest_detail: {
      featureKey: "curated_manifest_detail",
      mode: "preview",
      title: "Nimbus Plus required",
      subtitle:
        "You can preview the manifest here. Upgrade to Plus to unlock the full protocol stack and premium notes.",
      highlights: [
        "Full protocol stack and timing cues",
        "Expanded context, benefits, and reminders",
        "Access to premium purchase flow",
      ],
      primaryLabel: "Upgrade to Plus",
      secondaryLabel: "Keep previewing",
      upgradeRoute: ROUTES.AUTH.BILLING_UPGRADE,
    },
    curated_manifest_protocols: {
      featureKey: "curated_manifest_protocols",
      mode: "locked",
      title: "Protocol stack locked",
      subtitle:
        "The stack for this manifest is part of Nimbus Plus. Unlock the plan to open the full sequence.",
      highlights: [
        "Full protocol stack and timing cues",
        "Premium scheduling guidance",
        "Access to premium purchase flow",
      ],
      primaryLabel: "Upgrade to Plus",
      secondaryLabel: "Keep previewing",
      upgradeRoute: ROUTES.AUTH.BILLING_UPGRADE,
    },
  };

export const getPremiumGateState = (
  featureKey: PremiumGateFeatureKey,
  profile: UserProfile | null | undefined
): PremiumGateState => {
  if (hasPremiumAccess(profile)) return "allowed";
  return PREMIUM_GATE_CONFIG[featureKey].mode;
};
