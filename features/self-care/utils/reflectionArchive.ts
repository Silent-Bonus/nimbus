import { differenceInCalendarDays } from "date-fns";

import type { ReflectionCard } from "@/features/self-care/utils/reflections";

export type ReflectionArchiveFilter = "all" | "pastWeek" | "yesterday" | "fortnight";
export type ReflectionSessionFilter = "all" | "in_progress" | "completed";

export const REFLECTION_ARCHIVE_FILTERS: readonly {
  label: string;
  value: ReflectionArchiveFilter;
}[] = [
  { label: "All Seals", value: "all" },
  { label: "Past Week", value: "pastWeek" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Fortnight", value: "fortnight" },
];

// Archive pills collapse backend draft + in_progress into one UX bucket so
// users only see a single "In Progress" filter in the archive.
export const buildReflectionSessionStatusQuery = (
  filter: ReflectionSessionFilter
): string[] | undefined => {
  if (filter === "in_progress") {
    return ["in_progress", "draft"];
  }

  if (filter === "completed") {
    return ["completed"];
  }

  return undefined;
};

const parseReflectionDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const reflectionMatchesArchiveFilter = (
  reflection: ReflectionCard,
  filter: ReflectionArchiveFilter,
  now = new Date()
) => {
  if (filter === "all") return true;

  // Prefer the raw timestamp when available. `dateLabel` is only a fallback
  // for older card shapes that may not carry `createdAt`.
  const reflectionDate = parseReflectionDate(
    reflection.createdAt ?? reflection.dateLabel
  );
  if (!reflectionDate) return false;

  // Future-dated values should not leak into retrospective archive buckets.
  const dayDiff = differenceInCalendarDays(now, reflectionDate);
  if (dayDiff < 0) return false;

  switch (filter) {
    case "yesterday":
      return dayDiff === 1;
    case "pastWeek":
      return dayDiff <= 7;
    case "fortnight":
      return dayDiff <= 14;
    default:
      return true;
  }
};

export const filterReflectionArchiveEntries = (
  reflections: ReflectionCard[],
  filter: ReflectionArchiveFilter,
  now = new Date()
) =>
  // Keep the list-level helper thin so screens can reuse the same single-item
  // matching rule without duplicating the date logic.
  reflections.filter((reflection) =>
    reflectionMatchesArchiveFilter(reflection, filter, now)
  );
