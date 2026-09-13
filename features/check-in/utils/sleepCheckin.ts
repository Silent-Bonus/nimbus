import type { ColorSet } from "@/theme/types";

export type SleepStatus = "under" | "proper" | "over";

export type SleepPoint = {
  day: string;
  hours: number;
  status: SleepStatus;
};

export const IDEAL_SLEEP_RANGE = { min: 7, max: 9 };
export const REMINDER_OPTIONS = [30, 60, 90, 120];
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DEFAULT_BED_MINUTES = 22 * 60;
export const DEFAULT_WAKE_MINUTES = 7 * 60;
export const SLEEP_GOAL_MINUTES = 8 * 60;
export const CLOCK_FACE_MINUTES = 24 * 60;
export const CLOCK_TICK_MINUTES = [0, 6 * 60, 12 * 60, 18 * 60];

export const MOCK_WEEKLY_SLEEP: SleepPoint[] = [
  { day: "Mon", hours: 6.2, status: "under" },
  { day: "Tue", hours: 7.4, status: "proper" },
  { day: "Wed", hours: 8.1, status: "proper" },
  { day: "Thu", hours: 6.7, status: "under" },
  { day: "Fri", hours: 9.3, status: "over" },
  { day: "Sat", hours: 8.6, status: "proper" },
  { day: "Sun", hours: 7.8, status: "proper" },
];

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const pad2 = (value: number) => String(value).padStart(2, "0");

export const minutesToClock = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${pad2(mins)} ${ampm}`;
};

export const durationBetween = (bedMinutes: number, wakeMinutes: number) => {
  const diff = (wakeMinutes - bedMinutes + 1440) % 1440;
  return diff === 0 ? 0 : diff;
};

export const parseTimeToMinutes = (value?: string | null, fallback = 0) => {
  if (!value) return fallback;

  const input = String(value).trim();
  const hhmm = input.match(/(\d{1,2}):(\d{2})/);
  if (hhmm) {
    return clamp(Number(hhmm[1]) * 60 + Number(hhmm[2]), 0, 1439);
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getHours() * 60 + parsed.getMinutes();
  }

  return fallback;
};

export const minutesToAngle = (minutes: number) =>
  ((minutes % CLOCK_FACE_MINUTES) / CLOCK_FACE_MINUTES) * 360;

export const roundToMinuteStep = (minutes: number, step = 15) => {
  const rounded = Math.round(minutes / step) * step;
  return ((rounded % 1440) + 1440) % 1440;
};

export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const touchToMinutes = (
  x: number,
  y: number,
  bounds: { pageX: number; pageY: number; width: number; height: number }
) => {
  const centerX = bounds.pageX + bounds.width / 2;
  const centerY = bounds.pageY + bounds.height / 2;
  const angle =
    (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90 + 360;
  const normalizedAngle = angle % 360;
  return roundToMinuteStep((normalizedAngle / 360) * CLOCK_FACE_MINUTES);
};

export const describeClockArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const adjustedEnd = endAngle <= startAngle ? endAngle + 360 : endAngle;
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, adjustedEnd);
  const span = adjustedEnd - startAngle;
  const largeArcFlag = span > 180 ? "1" : "0";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
  ].join(" ");
};

export const buildWeeklySleepSeries = (
  raw: unknown,
  goalHours: number
): SleepPoint[] => {
  const source = Array.isArray(raw) ? raw : [];

  // Preserve the API order and use each entry's actual weekday. The API's
  // seven-day window can start mid-week, so index-based Mon-Sun mapping shifts
  // values onto the wrong day.
  const entries = source.length ? source : WEEK_DAYS;

  return entries.map((entry, index) => {
    const candidate = entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : null;
    const day = String(candidate?.day ?? WEEK_DAYS[index] ?? "");
    let hours = 0;

    if (typeof entry === "number") {
      hours = entry > 12 ? entry / 60 : (entry / 100) * goalHours;
    } else if (candidate) {
      const directHours = Number(candidate.hours);
      const directValue = Number(candidate.value);
      const percent = Number(candidate.percent);

      if (Number.isFinite(directHours) && directHours > 0) {
        hours = directHours;
      } else if (Number.isFinite(directValue) && directValue > 0) {
        hours = directValue > 12 ? directValue / 60 : directValue;
      } else if (Number.isFinite(percent) && percent > 0) {
        hours = (percent / 100) * goalHours;
      }
    }

    const roundedHours = Math.round(clamp(hours, 0, 12) * 10) / 10;
    const status: SleepStatus =
      roundedHours < IDEAL_SLEEP_RANGE.min
        ? "under"
        : roundedHours > IDEAL_SLEEP_RANGE.max
        ? "over"
        : "proper";

    return {
      day,
      hours: roundedHours,
      status,
    };
  });
};

export const hasMeaningfulSleepData = (data: SleepPoint[]) =>
  data.some((point) => point.hours > 0);

export const getSleepStatusColor = (status: SleepStatus, theme: ColorSet) => {
  if (status === "proper") return theme.chart1 ?? theme.accent ?? "#A3BE8C";
  if (status === "under") return theme.chart5 ?? "#EBCB8B";
  return theme.chart2 ?? theme.info ?? "#81A1C1";
};
