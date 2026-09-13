import type { DailyCheckIn } from "@/features/check-in/types/dailyCheckin";

import { transformDailyCheckinList } from "@/features/home/utils/biometricBlueprint";

describe("transformDailyCheckinList", () => {
  it("maps a daily check-in item into the template-ready shape", () => {
    const input = {
      id: 364,
      name: "Water Intake",
      target_unit: 8,
      completed_unit: 0,
      metric_unit: "ml",
      metric_count: 2000,
      completion_percentage: 0,
      tips: ["Drink water throughout the day."],
      interesting_text: "Water supports daily energy.",
    } as unknown as DailyCheckIn;

    expect(transformDailyCheckinList([input])).toEqual([
      {
        id: 364,
        name: "Water Intake",
        target_unit: 8,
        completed_unit: 0,
        completion_percentage: 0,
        daily_checkin: {
          protocol_details: {
            habit_id: 364,
            habit_name: "Water Intake",
            template_name: "Daily Trackers",
            metric_unit: "ml",
            metric_count: 2000,
          },
          goal_details: {
            target: 2000,
            completed: 0,
            completion_percentage: 0,
            remaining: 2000,
            unit: "ml",
            description: "Reach 2000 ml today.",
          },
          tips: ["Drink water throughout the day."],
          interesting_text: "Water supports daily energy.",
        },
      },
    ]);
  });
});
