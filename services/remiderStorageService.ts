// services/reminderStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { StoreKey } from "@/constants/Constant";
// import { saveNotificationChange } from "./settingService";

type DayShort = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type BackendNotification = {
  notification_type: string; // e.g. "morning_review"
  enabled: boolean;
  time: string; // "07:30:00" (HH:mm:ss)
  days_of_week?: DayShort[]; // ["mon","thu"]
};

const DAY_MAP: DayShort[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export type ReminderSettings = {
  // timeISO: string; // e.g. "2025-09-10T07:30:00.000Z"
  repeat: "once" | "daily" | "weekdays" | "weekends" | "custom";
  weekdays?: number[]; // 0..6 (Sun..Sat)

  notification_type: string; // e.g. "morning_review"
  enabled: boolean;
  time: string; // "07:30:00" (HH:mm:ss)
  days_of_week?: DayShort[]; // ["mon","thu"]
};

const PREFIX = "@nimbus_reminder_";
export const storageKey = (type: string) => PREFIX + type;

export type NotificationsByType = Record<
  string,
  Omit<BackendNotification, "notification_type">
>;

/**
 * Convert backend array -> keyed map
 */
export const mapNotificationsByType = (
  notifications: BackendNotification[] | undefined | null
): NotificationsByType => {
  if (!notifications || !Array.isArray(notifications)) return {};
  return notifications.reduce<NotificationsByType>((acc, curr) => {
    const { notification_type, ...rest } = curr;
    if (notification_type) acc[notification_type] = rest;
    return acc;
  }, {});
};

/**
 * Default dummy entries for all reminder types we want available in UI.
 * Backend values will override these when present.
 */
const DEFAULT_BACKEND_ENTRIES: NotificationsByType = {
  night_review: {
    enabled: false,
    time: "21:30:00",
    days_of_week: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
  },
  mood_logger: {
    enabled: true,
    time: "12:00:00",
    days_of_week: ["mon", "tue", "wed", "thu", "fri"],
  },
  streak_saver: {
    enabled: false,
    time: "20:00:00",
    days_of_week: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
  },
};

/**
 * Merge backend map with defaults - backend wins.
 */
const mergeWithDefaults = (backendMap: NotificationsByType | null) => {
  let out: NotificationsByType = { ...DEFAULT_BACKEND_ENTRIES };
  console.log(backendMap, "backendMapbackendMapbackendMap");
  if (!backendMap) return out;
  // for (const k of Object.keys(backendMap)) {
  out = {
    ...backendMap,
    ...DEFAULT_BACKEND_ENTRIES,
  };
  // }
  return out;
};

/**
 * Read user-profile from SecureStore and return a keyed map that contains
 * backend values (if present) merged with dummy entries for other types.
 *
 * Returned shape: { morning_review: { enabled, time, days_of_week }, night_review: {...}, ... }
 */
export const getReminder = async (): Promise<NotificationsByType> => {
  try {
    const r = await SecureStore.getItem(StoreKey.USER_PROFILE_KEY);

    if (!r) {
      // no profile — return defaults so UI has consistent keys
      return mergeWithDefaults(null);
    }

    const parsed = JSON.parse(r);

    let backendMap: NotificationsByType | null = null;

    // parsed.notifications may be array or keyed object depending on backend.
    if (Array.isArray(parsed?.notifications)) {
      // console.log("parsed.notifications is array");
      backendMap = mapNotificationsByType(
        parsed.notifications as BackendNotification[]
      );
    } else if (
      parsed?.notifications &&
      typeof parsed.notifications === "object"
    ) {
      // assume it's already keyed e.g. { morning_review: { enabled, time, days_of_week }, ... }
      backendMap = parsed.notifications as NotificationsByType;
    } else {
      backendMap = null;
    }
    // console.log(backendMap, mergeWithDefaults(backendMap), "backendMap");
    return mergeWithDefaults(backendMap);
  } catch (e) {
    console.warn("getReminder error", e);
    return mergeWithDefaults(null);
  }
};

export const getUserProfileInfo = async () => {
  try {
    const r = await SecureStore.getItem(StoreKey.USER_PROFILE_KEY);
    if (!r) return null;
    // const parsed = JSON.parse(r);
    return r;
  } catch (e) {
    console.warn("getUserProfile error", e);
    return null;
  }
};

/**
 * saveReminder / removeReminder maintained for local persistence/back-compat.
 * Consider implementing server API calls if saving must update backend user's profile.
 */
// export const saveReminder = async (payload: any) => {
//   try {
//     // const now = new Date().toISOString();
//     // const toSave = { ...payload, lastUpdated: now };
//     // await AsyncStorage.setItem(storageKey(type), JSON.stringify(toSave));
//     const result = await saveNotificationChange(payload);

//     if (result && result.success) {
//       return result;
//     }

//     if (result && result.error_code) {
//       return result;
//     }

//     // return toSave;
//   } catch (e) {
//     console.warn("saveReminder error", e);
//     throw e;
//   }
// };

export const removeReminder = async (type: string) => {
  try {
    await AsyncStorage.removeItem(storageKey(type));
  } catch (e) {
    console.warn("removeReminder error", e);
  }
};
