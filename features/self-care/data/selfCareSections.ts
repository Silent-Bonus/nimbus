import { ROUTES } from "@/constants/routes";
import type { SelfCareSectionConfig } from "@/features/self-care/types/selfCare";

export const SELF_CARE_SECTIONS: SelfCareSectionConfig[] = [
  {
    eyebrow: "Cognitive Core",
    title: "Mind",
    actions: [
      {
        label: "Reflection",
        description: "Clear the mental noise",
        icon: "book-edit-outline",
        route: ROUTES.AUTH.SELF_CARE_REFLECTIONS,
      },
      {
        label: "Meditation",
        description: "Return to stillness",
        icon: "meditation",
        route: ROUTES.AUTH.SELF_CARE_MEDITATION,
        navigationMode: "navigate",
      },
      {
        label: "Breath Work",
        description: "Regulate your rhythm",
        icon: "weather-windy",
        route: ROUTES.AUTH.SELF_CARE_BREATHWORK,
      },
    ],
  },
  {
    eyebrow: "Physical Vitality",
    title: "Body",
    actions: [
      {
        label: "Vitals",
        description: "Read your body signals",
        icon: "heart-pulse",
        route: ROUTES.AUTH.SELF_CARE_VITALS,
      },
      {
        label: "Meal Planner",
        description: "Nourish your body with intention",
        icon: "silverware-fork-knife",
        route: ROUTES.AUTH.TOOLS_MEAL_PLANNER,
      },
    ],
  },
  {
    eyebrow: "Inner Resonance",
    title: "Soul",
    actions: [
      {
        label: "Affirmation",
        description: "Reframe your inner voice",
        icon: "cards-heart-outline",
        route: ROUTES.AUTH.SELF_CARE_AFFIRMATION,
      },
      {
        label: "Soundscape",
        description: "Tune into a softer state",
        icon: "music-circle-outline",
        route: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE,
      },
    ],
  },
];
