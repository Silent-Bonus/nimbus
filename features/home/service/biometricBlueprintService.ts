import { getCheckinList } from "@/features/check-in/services/dailyCheckinService";
import { getBlueprintItems } from "@/features/home/utils/biometricBlueprint";
import type { LoadedCheckin } from "@/features/home/types/biometricBlueprint";

/** Fetches and normalizes the selected day's check-ins for the home blueprint. */
export const getBiometricBlueprintItems = async (
  date: string,
): Promise<LoadedCheckin[]> => {
  const response = await getCheckinList(date, true);
  return getBlueprintItems(response);
};
