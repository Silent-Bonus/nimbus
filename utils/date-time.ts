import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isTomorrow,
  addDays,
  subDays,
  startOfDay,
  isValid,
  parse,
} from "date-fns";

/**
 * Nimbus Date & Time Standards
 * ----------------------------
 * Backend Date: "yyyy-MM-dd"
 * Backend Time: "HH:mm:ss"
 * UI Date:      "EEE, MMM d" (Mon, Oct 12)
 * UI Time:      "h:mm a"     (8:30 PM)
 * UI Full:      "PPP"        (Jan 2nd, 2026)
 */

export const DATE_FORMATS = {
  API_DATE: "yyyy-MM-dd",
  API_TIME: "HH:mm:ss",
  DISPLAY_DATE: "EEE, MMM d",
  DISPLAY_TIME: "h:mm a",
  DISPLAY_DAY: "EEEE",
  MONTH_YEAR: "MMMM yyyy",
  SHORT_MONTH: "MMM",
};

// Re-exporting some common formats for backward compatibility
export const BACKEND_TIME_FORMAT = DATE_FORMATS.API_TIME;
export const UI_TIME_FORMAT = DATE_FORMATS.DISPLAY_TIME;
export const HHMM_24 = "HH:mm";

// ─────────────────────────────────────────────────────────────────────────────
// 1. BASIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function isValidDate(d: any): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/** Check if two dates are the same day (local time) */
export const isSameDayLocal = (d1: Date, d2: Date): boolean => {
  return format(d1, "yyyyMMdd") === format(d2, "yyyyMMdd");
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. BACKEND TRANSFORMATIONS (To API)
// ─────────────────────────────────────────────────────────────────────────────

/** Convert Date object to "yyyy-MM-dd" */
export const toApiDate = (date: Date): string => {
  if (!isValid(date)) return format(new Date(), DATE_FORMATS.API_DATE);
  return format(date, DATE_FORMATS.API_DATE);
};

/** Convert Date object to "HH:mm:ss" */
export const toApiTime = (date: Date): string => {
  if (!isValid(date)) return "00:00:00";
  return format(date, DATE_FORMATS.API_TIME);
};

export const toISODate = (d: Date) => toApiDate(d);

/** Convert Date object to HH:mm:ss for backend */
export function toBackendTime(value?: Date | null): string | undefined {
  if (!value || !isValidDate(value)) return undefined;
  return format(value, BACKEND_TIME_FORMAT);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FRONTEND TRANSFORMATIONS (From API)
// ─────────────────────────────────────────────────────────────────────────────

/** Parse "yyyy-MM-dd" or ISO string into a valid Date object */
export const fromApiDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : new Date();
};

/** Parse HH:mm (24h) into a Date object (today's date) */
export function fromHHmm(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Parse backend time string (HH:mm:ss) into a Date object */
export function parseBackendTimeToDate(
  time?: string | null,
  baseDate: Date = new Date()
): Date | null {
  if (!time) return null;
  const d = parse(time, BACKEND_TIME_FORMAT, baseDate);
  return isValidDate(d) ? d : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. UI DISPLAY HELPERS (For User)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns "Today", "Yesterday", "Tomorrow" or "Mon, Jan 2" */
export const toFriendlyDate = (date: Date | string): string => {
  const d = typeof date === "string" ? fromApiDate(date) : date;
  if (!isValid(d)) return "";

  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isTomorrow(d)) return "Tomorrow";

  return format(d, DATE_FORMATS.DISPLAY_DATE);
};

/** Returns "8:30 PM" from HH:mm:ss or Date */
export const toFriendlyTime = (date: Date | string): string => {
  if (date instanceof Date) return format(date, DATE_FORMATS.DISPLAY_TIME);
  const d = parseISO(`1970-01-01T${date}`);
  if (!isValid(d)) return "";
  return format(d, DATE_FORMATS.DISPLAY_TIME);
};

/** Returns a clean range like "1 Jan — 7 Jan" */
export const toFriendlyRange = (start: Date, end: Date): string => {
  return `${format(start, "d MMM")} — ${format(end, "d MMM")}`;
};

/** Returns "Sun", "Mon", etc. */
export const formatDay = (date: Date) => format(date, "EEE");

/** Returns "25", "01", etc. */
export const formatDate = (date: Date) => format(date, "dd");

/** Formats a Date to UI standard time string */
export function formatTimeUI(value?: Date | null, fallback = ""): string {
  if (value && isValidDate(value)) return format(value, UI_TIME_FORMAT);
  return fallback;
}

/** Formats a time range for UI display */
export function formatTimeRangeUI(
  start?: Date | null,
  end?: Date | null,
  fallback = ""
): string {
  if (start && isValidDate(start) && end && isValidDate(end)) {
    return `${format(start, UI_TIME_FORMAT)} - ${format(end, UI_TIME_FORMAT)}`;
  }
  if (start && isValidDate(start)) return format(start, UI_TIME_FORMAT);
  return fallback;
}

/** Handles various raw time formats (epoch, HH:mm, ISO) and returns "hh:mm a" */
export const formatReminderTime = (raw: any, fallback = "8:00 AM") => {
  if (!raw) return fallback;

  try {
    let d: Date | null = null;

    if (typeof raw === "number") {
      const ms = raw.toString().length === 10 ? raw * 1000 : raw;
      d = new Date(ms);
    } else if (typeof raw === "string") {
      if (/am|pm/i.test(raw)) return raw;

      if (/^\d{2}:\d{2}$/.test(raw)) {
        d = new Date(`1970-01-01T${raw}:00`);
      } else if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
        d = new Date(`1970-01-01T${raw}`);
      } else {
        d = new Date(raw);
      }
    }

    if (!d || isNaN(d.getTime())) return fallback;
    return format(d, "hh:mm a");
  } catch {
    return fallback;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DURATION & REMINDER OBJECT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export type DurationLike = {
  all_day?: boolean;
  start_time?: Date | null;
  end_time?: Date | null;
};

export function formatDurationDisplay(
  duration?: DurationLike | null,
  opts?: { allDayLabel?: string; fallback?: string }
): string {
  const allDayLabel = opts?.allDayLabel ?? "All Day";
  const fallback = opts?.fallback ?? "";

  if (!duration) return fallback;
  if (duration.all_day) return allDayLabel;

  return formatTimeRangeUI(duration.start_time, duration.end_time, fallback);
}

export function toBackendDurationPayload(duration: DurationLike): any {
  if (duration.all_day) return { all_day: true };

  const start = toBackendTime(duration.start_time ?? null);
  const end = toBackendTime(duration.end_time ?? null);

  if (!start) return {};
  return end ? { start_time: start, end_time: end } : { start_time: start };
}

export type ReminderLike = {
  time?: string; // backend format "HH:mm:ss"
  ten_min_before?: boolean;
  thirty_min_before?: boolean;
};

export function formatReminderDisplay(
  reminder?: ReminderLike | null,
  opts?: { fallback?: string }
) {
  const fallback = opts?.fallback ?? "Select the preset";
  if (!reminder) return fallback;

  if (reminder.time) {
    const d = parseBackendTimeToDate(reminder.time);
    return d ? formatTimeUI(d, fallback) : fallback;
  }

  if (reminder.ten_min_before) return "10 min before";
  if (reminder.thirty_min_before) return "30 min before";

  return fallback;
}

export function toBackendReminderPayload(reminder: ReminderLike) {
  if (reminder.time) return { time: reminder.time };
  if (reminder.ten_min_before) return { ten_min_before: true };
  if (reminder.thirty_min_before) return { thirty_min_before: true };
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. BUSINESS LOGIC & MATH
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a range of dates around a center point */
export const generateDateRange = (center: Date, rangeCount = 14) => {
  const dates: Date[] = [];
  const start = subDays(startOfDay(center), rangeCount);
  for (let i = 0; i <= rangeCount * 2; i++) {
    dates.push(addDays(start, i));
  }
  return dates;
};

/** Calculate duration in minutes between two dates */
export function durationFromRange(start: Date, end: Date) {
  const s = start.getHours() * 60 + start.getMinutes();
  const e = end.getHours() * 60 + end.getMinutes();
  const diff = (e - s + 24 * 60) % (24 * 60);
  return diff === 0 ? 24 * 60 : diff;
}

/** Formats minutes into "1h 30m" or "2h" */
export function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${pad(m)}m`;
}

/** HH:mm helpers (24h, no seconds) */
export function toHHmm(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
