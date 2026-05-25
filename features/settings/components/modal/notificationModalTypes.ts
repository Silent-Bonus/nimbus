import type { NotificationType, ReminderSettings, DayShort } from "@/types/notificationType";

export type NotificationReminderItem = NotificationType & {
  enabled?: boolean;
  time?: string | null;
  repeat?: ReminderSettings["repeat"] | null;
  weekdays?: number[];
  days_of_week?: DayShort[];
};

export type ReminderDraft = {
  enabled: boolean;
  time: string | null;
  timeISO: string;
  weekdays: number[];
  days_of_week: DayShort[];
  repeat: ReminderSettings["repeat"];
  displayTime: string;
};

export type ReminderPatch = {
  notifications: {
    notification_type: string;
    enabled?: boolean;
    time?: string;
    days_of_week?: DayShort[];
  }[];
};
