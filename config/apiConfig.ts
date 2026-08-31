// apiConfig.ts

// Define base URLs for different environments
const ENV = process.env.NODE_ENV as "development" | "staging" | "production";

// Define the base URL for different environments
const BASE_URLS = {
  development: "https://nimbus.silentbonus.com",
  staging: "https://nimbus.silentbonus.com",
  production: "https://nimbus.silentbonus.com",
};

// Get the base URL based on the environment
const BASE_URL = BASE_URLS[ENV];
export const API_URL = BASE_URL;

// Define API endpoints
export const API_ENDPOINTS = {
  login: `${BASE_URL}/api/v1/auth/login/`,
  register: `${BASE_URL}/api/v1/auth/register/`,
  logout: `${BASE_URL}/api/v1/auth/logout/`,

  fetchUserDetails: `${BASE_URL}/api/v1/profile/users/me/`,

  getOtp: `${BASE_URL}/api/v1/auth/request-otp/`,
  verifyOtp: `${BASE_URL}/api/v1/auth/verify-otp/`,

  setPassword: `${BASE_URL}/api/v1/auth/set-password/`,
  forgotPassword: `${BASE_URL}/api/v1/auth/forgot-password/`,
  changePassword: `${BASE_URL}/api/v1/auth/reset-password/`,

  createHabit: `${BASE_URL}/api/v1/habits/`,
  bulkCreateHabit: `${BASE_URL}/api/v1/habits/bulk_create/`,
  activateHabitTemplate: (id: number | string) =>
    `${BASE_URL}/api/habit-templates/${id}/activate/`,
  habitTypeList: `${BASE_URL}/api/v1/habit-types/`,
  habitTagList: `${BASE_URL}/api/v1/tags/`,
  habitDetailsById: `${BASE_URL}/api/v1/habits/`,
  habitDelete: `${BASE_URL}/api/v1/habits/delete`,
  habitUnit: `${BASE_URL}/api/v1/habit-units/`,

  habitPatch: `${BASE_URL}/api/v1/habits/`,

  getArticleList: `${BASE_URL}/api/v1/media/media-assets/?type=article`,
  getArticleDetails: `${BASE_URL}/api/v1/media/media-assets/`,
  getSoundscapeList: `${BASE_URL}/api/v1/media/media-assets/?type=soundscape`,

  getReflectionList: `${BASE_URL}/api/v1/reflect/templates/`,
  getReflectionCategories: `${BASE_URL}/api/v1/reflect/categories/`,
  getReflectionDetail: (templateId: string) =>
    `${BASE_URL}/api/v1/reflect/templates/${templateId}/`,
  startReflectionSession: `${BASE_URL}/api/v1/reflect/sessions/`,
  getReflectionSessionList: `${BASE_URL}/api/v1/reflect/sessions/`,
  getReflectionSession: (sessionId: number | string) =>
    `${BASE_URL}/api/v1/reflect/sessions/${sessionId}/`,
  abandonReflectionSession: (sessionId: number | string) =>
    `${BASE_URL}/api/v1/reflect/sessions/${sessionId}/abandon/`,
  saveReflectionSessionStep: (sessionId: number | string, stepNumber: number) =>
    `${BASE_URL}/api/v1/reflect/sessions/${sessionId}/steps/${stepNumber}/`,
  completeReflectionSession: (sessionId: number | string) =>
    `${BASE_URL}/api/v1/reflect/sessions/${sessionId}/complete/`,
  submitReflection: `${BASE_URL}/api/v1/assesments/journal-entries/`,
  getReflectionEntries: `${BASE_URL}/api/v1/assesments/journal-entries/`,

  getWorkoutVideoList: `${BASE_URL}/api/v1/media/media-assets/?type=video`,
  getNewsletterList: `${BASE_URL}/api/v1/newsletter/`,
  getNewsletterDetails: (slug: number | string) =>
    `${BASE_URL}/api/v1/newsletter/${slug}/`,
  getRecipeList: `${BASE_URL}/api/v1/recipes/`,
  getRecipeCategories: `${BASE_URL}/api/v1/recipes/categories/`,
  getRecipeFavorites: `${BASE_URL}/api/v1/recipes/favorites/`,
  getRecipeDetails: (id: number | string) =>
    `${BASE_URL}/api/v1/recipes/${id}/`,
  getRecipeFavorite: (id: number | string) =>
    `${BASE_URL}/api/v1/recipes/${id}/favorite/`,
  submitRecipeReview: (id: number | string) =>
    `${BASE_URL}/api/v1/recipes/${id}/reviews/`,
  searchRecipes: (query: string) =>
    `${BASE_URL}/api/v1/recipes/?search=${encodeURIComponent(query)}`,
  //TODO: category Data fix
  getShortVideoList: `${BASE_URL}/api/v1/media/media-assets/?type=shortVideo`,
  getAudioBookList: `${BASE_URL}/api/v1/media/media-assets/?type=meditation&category=audioBook`,
  getMeditationList: `${BASE_URL}/api/v1/media/media-assets/?type=meditation&category=breathwork`,
  getWellnessContent: `${BASE_URL}/api/v1/wellness-content/`,

  getAffirmations: `${BASE_URL}/api/v1/wellness-content/affirmations/`,
  createAffirmation: `${BASE_URL}/api/v1/wellness-content/affirmations/`,
  getAffirmationDetail: (slug: string) =>
    `${BASE_URL}/api/v1/wellness-content/affirmations/${slug}/`,

  getWellnessContentDetail: (id: number | string) =>
    `${BASE_URL}/api/v1/wellness-content/${id}/`,
  createWellnessSession: `${BASE_URL}/api/v1/wellness/sessions/`,
  getWellnessSessionList: `${BASE_URL}/api/v1/wellness/sessions/`,
  getWellnessSessionByRef: (sessionRef: string) =>
    `${BASE_URL}/api/v1/wellness/sessions/${sessionRef}/`,
  pauseWellnessSession: (sessionRef: string) =>
    `${BASE_URL}/api/v1/wellness/sessions/${sessionRef}/pause/`,
  resumeWellnessSession: (sessionRef: string) =>
    `${BASE_URL}/api/v1/wellness/sessions/${sessionRef}/resume/`,
  completeWellnessSession: (sessionRef: string) =>
    `${BASE_URL}/api/v1/wellness/sessions/${sessionRef}/complete/`,
  submitWellnessSessionFeedback: (sessionRef: string) =>
    `${BASE_URL}/api/v1/wellness/sessions/${sessionRef}/feedback/`,
  createMoodLog: `${BASE_URL}/api/v1/wellness/mood-logs/`,
  getMoodLogStats: `${BASE_URL}/api/v1/wellness/mood-logs/stats/`,
  getWellnessSummary: `${BASE_URL}/api/v1/wellness/summary/`,

  getMentalTestList: `${BASE_URL}/assesment/assessments/`,

  getWorkouts: `${BASE_URL}/api/v1/workouts/`,
  getWorkoutDetails: (id: number | string) => `${BASE_URL}/workouts/${id}/`,

  getWeeklyMealPlan: (startDate: string) =>
    `${BASE_URL}/api/v1/meals/plans/week/?start_date=${startDate}`,

  getMealPlanPdf: (startDate: string, endDate: string) =>
    `${BASE_URL}/api/v1/meals/plans/pdf/?start_date=${startDate}&end_date=${endDate}`,

  getDailyMealPlan: (date?: string) =>
    date
      ? `${BASE_URL}/api/v1/meals/plans/?date=${date}`
      : `${BASE_URL}/api/v1/meals/plans/today/`,
  getMealDashboard: (days: number = 30) =>
    `${BASE_URL}/api/v1/meals/dashboard/?days=${days}`,
  addMealItem: `${BASE_URL}/api/v1/meals/items/`,
  bulkUpdateMealPlan: `${BASE_URL}/api/v1/meals/plans/bulk_update/`,
  scribbles: `${BASE_URL}/api/v1/scribbles/`,
  recentScribbleTags: `${BASE_URL}/api/v1/scribbles/recent_tags/`,
  calorieCalculator: `${BASE_URL}/api/v1/calculators/calories/`,
  proteinIntakeCalculator: `${BASE_URL}/api/v1/calculators/protein/`,
  bodyShapeCalculator: `${BASE_URL}/api/v1/calculators/body_shape/`,

  reportBug: `${BASE_URL}/api/v1/bug-reports/`,
  logFeedback: `${BASE_URL}/api/v1/feedback/`,

  personaQuestion: `${BASE_URL}/api/v1/profile/persona-questions/`,
  submitPersonaAnswers: `${BASE_URL}/api/v1/profile/persona-answers/`,
  contactUs: `${BASE_URL}/support/tickets/`,

  markHabitDone: (habitId: number) =>
    `${BASE_URL}/api/v1/habits/${habitId}/mark_complete/`,

  // ✅ NEW: Function for fetching habits with date & filter
  getDailyCheckInByDate: (date: string, isDailyCheckIn = true) =>
    `${BASE_URL}/api/v1/habits/?date=${date}&is_daily_checkin=${isDailyCheckIn}`,
  // ✅ NEW: Function for fetching habits with date & filter
  // ✅ Dynamic: fetch single habit details by id + date
  getHabitDetailsByDate: (habitId: number, date: string) =>
    `${BASE_URL}/api/v1/habits/${habitId}/?date=${date}`,
};
