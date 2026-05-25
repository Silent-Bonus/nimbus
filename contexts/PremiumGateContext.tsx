import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { router } from "expo-router";

import PremiumGateModal from "@/components/ui/modal/PremiumGateModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  PREMIUM_GATE_CONFIG,
  getPremiumGateState,
  type PremiumGateConfig,
  type PremiumGateFeatureKey,
  type PremiumGateSource,
  type PremiumGateState,
} from "@/features/entitlements/premiumGates";

type PremiumGateRequest = {
  featureKey: PremiumGateFeatureKey;
  source: PremiumGateSource;
};

type PremiumGateContextValue = {
  openGate: (
    featureKey: PremiumGateFeatureKey,
    source?: PremiumGateSource
  ) => void;
  closeGate: () => void;
  getAccessState: (featureKey: PremiumGateFeatureKey) => PremiumGateState;
  canAccess: (featureKey: PremiumGateFeatureKey) => boolean;
  activeGate: PremiumGateRequest | null;
};

const PremiumGateContext = createContext<PremiumGateContextValue | null>(null);

export function usePremiumGate() {
  const context = useContext(PremiumGateContext);

  if (!context) {
    throw new Error("usePremiumGate must be used within a <PremiumGateProvider />");
  }

  return context;
}

type PremiumGateProviderProps = {
  children: ReactNode;
};

export function PremiumGateProvider({ children }: PremiumGateProviderProps) {
  const { userProfile } = useAuth();
  const [activeGate, setActiveGate] = useState<PremiumGateRequest | null>(null);

  const getAccessState = useCallback(
    (featureKey: PremiumGateFeatureKey) =>
      getPremiumGateState(featureKey, userProfile),
    [userProfile]
  );

  const canAccess = useCallback(
    (featureKey: PremiumGateFeatureKey) => getAccessState(featureKey) === "allowed",
    [getAccessState]
  );

  const closeGate = useCallback(() => {
    setActiveGate(null);
  }, []);

  const openGate = useCallback(
    (featureKey: PremiumGateFeatureKey, source: PremiumGateSource = "cta_press") => {
      if (getAccessState(featureKey) === "allowed") return;
      setActiveGate({ featureKey, source });
    },
    [getAccessState]
  );

  useEffect(() => {
    if (!activeGate) return;
    // Close the sheet if the user upgrades while it is open.
    if (getAccessState(activeGate.featureKey) === "allowed") {
      setActiveGate(null);
    }
  }, [activeGate, getAccessState]);

  const activeConfig: PremiumGateConfig | null = useMemo(() => {
    if (!activeGate) return null;
    return PREMIUM_GATE_CONFIG[activeGate.featureKey];
  }, [activeGate]);

  const handleUpgrade = useCallback(() => {
    if (!activeConfig) return;

    closeGate();
    router.push(activeConfig.upgradeRoute);
  }, [activeConfig, closeGate]);

  const contextValue = useMemo<PremiumGateContextValue>(
    () => ({
      openGate,
      closeGate,
      getAccessState,
      canAccess,
      activeGate,
    }),
    [activeGate, canAccess, closeGate, getAccessState, openGate]
  );

  return (
    <PremiumGateContext.Provider value={contextValue}>
      {children}

      {/* Single global paywall sheet for the whole app. */}
      <PremiumGateModal
        visible={!!activeConfig}
        onClose={closeGate}
        onUpgrade={handleUpgrade}
        title={activeConfig?.title ?? "Nimbus Plus required"}
        subtitle={
          activeConfig?.subtitle ??
          "Upgrade to unlock this experience."
        }
        highlights={activeConfig?.highlights ?? []}
        primaryLabel={activeConfig?.primaryLabel ?? "Upgrade to Plus"}
        secondaryLabel={activeConfig?.secondaryLabel ?? "Keep previewing"}
      />
    </PremiumGateContext.Provider>
  );
}
