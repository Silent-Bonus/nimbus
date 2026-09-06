/**
 * @file routes.ts
 * @description Centralized navigation paths for the application.
 * Use these constants to avoid hardcoded strings and ensure type safety.
 */

export const ROUTES = {
  /**
   * Public Routes (Non-Authenticated)
   */
  PUBLIC: {
    LANDING: "/(public)/landing",
    SIGN_IN: "/(public)/sign-in",
    REGISTER: "/(public)/register",
    FORGOT_PASSWORD: "/(public)/forgot-password",
    RESET_PASSWORD: "/(public)/reset-password",
    VERIFY_OTP: "/(public)/verify-otp",
  },

  /**
   * Main Tab Routes
   */
  TABS: {
    HOME: "/(auth)/(tabs)",
    SELF_CARE: "/(auth)/(tabs)/self-care",
    TOOLS: "/(auth)/(tabs)/tools",
    SETTINGS: "/(auth)/(tabs)/settings",
  },

  /**
   * Feature-Specific Routes (Authenticated)
   */
  AUTH: {
    // Habit
    CREATE_HABIT: "/(auth)/habit/createHabit",
    HABIT_DETAIL: "/(auth)/habit/habitDetail",

    // Tools
    TOOLS_PRODUCT_LIST: "/(auth)/tools/productList",
    TOOLS_MEAL_WEEKLY: "/(auth)/tools/mealWeeklyView",
    TOOLS_MEAL_CREATION: "/(auth)/tools/mealCreation",
    TOOLS_AI_THERAPY: "/(auth)/tools/aiTherapy",
    TOOLS_ROUTINE_LIST: "/(auth)/tools/templateRoutineList",
    TOOLS_CURATED_MANIFESTS: "/(auth)/tools/curatedManifests",
    TOOLS_CURATED_MANIFEST_DETAIL: "/(auth)/tools/curatedManifestDetail",
    TOOLS_CURATED_MANIFEST_PROTOCOLS: "/(auth)/tools/curatedManifestProtocols",
    CREATE_PROTOCOL: "/(auth)/habit/createProtocol",
    TOOLS_ARTICLE_LIST: "/(auth)/tools/articleList",
    TOOLS_SCRIBBLE_DETAIL: "/(auth)/tools/scribbleDetail",
    TOOLS_MEAL_PLANNER: "/(auth)/tools/mealPlanner",
    TOOLS_CREATE_SCRIBBLE: "/(auth)/tools/createScribble",
    TOOLS_SCRIBBLE_LIST: "/(auth)/tools/scribbleList",
    TOOLS_BODY_ARCHITECTURE: "/(auth)/tools/bodyArchitecture",
    TOOLS_CALORIE_CALC: "/(auth)/tools/calorieCalculator",
    TOOLS_RECIPE: "/(auth)/tools/recipe",
    TOOLS_RECIPE_DETAIL: "/(auth)/tools/recipeDetail",
    TOOLS_ARTICLE_DETAIL: "/(auth)/tools/articleDetail",

    // Self Care
    SELF_CARE_THINGS_TO_DO: "/(auth)/self-care/thingsToDo",
    SELF_CARE_SLEEP: "/(auth)/self-care/sleep",
    SELF_CARE_REFLECTIONS: "/(auth)/self-care/reflections",
    SELF_CARE_REFLECTION_DETAIL:
      "/(auth)/self-care/reflections/detail/[journalSlug]",
    SELF_CARE_REFLECTION_ENTRY: "/(auth)/self-care/reflections/[journalId]",
    SELF_CARE_REFLECTION_SUBMISSION:
      "/(auth)/self-care/reflections/submission",
    SELF_CARE_REFLECTION_ARCHIVE: "/(auth)/self-care/reflections/archive",
    SELF_CARE_AFFIRMATION: "/(auth)/self-care/affirmation",
    SELF_CARE_CREATE_AFFIRMATION: "/(auth)/self-care/create-affirmation",
    SELF_CARE_BREATHWORK: "/(auth)/self-care/breathwork",
    SELF_CARE_BREATHWORK_DETAIL:
      "/(auth)/self-care/breathwork/[breathworkId]",
    SELF_CARE_BREATHWORK_SESSION:
      "/(auth)/self-care/breathwork/session/[breathworkId]",
    SELF_CARE_MEDITATION: "/(auth)/self-care/meditation",
    SELF_CARE_MEDITATION_DETAIL: "/(auth)/self-care/meditation/detail/[meditationId]",
    SELF_CARE_MEDITATION_PLAYER: "/(auth)/self-care/meditation/player/[meditationId]",
    SELF_CARE_SOUNDSCAPE: "/(auth)/self-care/soundscape",
    SELF_CARE_SOUNDSCAPE_DETAIL: "/(auth)/self-care/soundscape/detail/[soundscapeId]",
    SELF_CARE_SOUNDSCAPE_PLAYER: "/(auth)/self-care/soundscape/player/[soundscapeId]",
    SELF_CARE_CALORIE_THRESHOLD: "/(auth)/self-care/calorie-threshold",
    SELF_CARE_BODY_ARCHITECTURE: "/(auth)/self-care/body-architecture",
    SELF_CARE_VITALS_TRENDS: "/(auth)/self-care/vitals-trends",
    SELF_CARE_WORKOUT_SESSION: "/(auth)/self-care/workoutSession",
    SELF_CARE_WORKOUT: "/(auth)/self-care/workout",
    SELF_CARE_VITALS: "/(auth)/self-care/vitals",
    SELF_CARE_PROTEIN: "/(auth)/self-care/protein",

    // Check-in
    CHECK_IN_SLEEP: "/(auth)/check-in/sleep",
    CHECK_IN_MEDITATION: "/(auth)/check-in/meditation",
    CHECK_IN_MEDITATION_ANCHOR: "/(auth)/check-in/meditation-anchor",
    CHECK_IN_WATER: "/(auth)/check-in/water",
    CHECK_IN_READING: "/(auth)/check-in/reading",

    // Billing
    BILLING_UPGRADE: "/(auth)/billing/upgrade",
    BILLING_CHOOSE_METHOD: "/(auth)/billing/choosePaymentMethod",
    BILLING_REVIEW_SUMMARY: "/(auth)/billing/reviewPaymentSummary",

    // Onboarding & New User
    ONBOARDING_WELCOME: "/(auth)/onboarding/welcome",
    ONBOARDING_QUESTIONS: "/(auth)/onboarding/questions",
    NEW_USER: "/(auth)/new-user",

    // Others
    COACH: "/(auth)/coach",
    REWARDS: "/(auth)/rewards",
    ADVANCED_SETTINGS: "/(auth)/advanced-settings",
    NOTIFICATIONS: "/(auth)/notifications",
    STATISTICS_DETAILS: "/(auth)/statistics/details",
    SUCCESS_STATE: "/(auth)/state/success",
  },
} as const;

/**
 * Type helper for Route constants
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
