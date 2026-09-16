// Post

// For reminder Time or preset
// For water count

// Get Response
// Water CheckIn Data for a week

export const waterIntakeData = {
  targetUnit: 10,
  completedUnit: 4,
  weeklyData: [
    { day: "Mon", percent: 40 },
    { day: "Tue", percent: 60 },
    { day: "Wed", percent: 90 },
    { day: "Thu", percent: 70 },
    { day: "Fri", percent: 100 },
    { day: "Sat", percent: 75 },
    { day: "Sun", percent: 35 },
  ],
};

// sleep checking
// Post API For

// 1. For reminder Time or preset
// 2. For sleep hours logged : 2,3 hours

// Get Response

export const sleepData = {
  goalMinutes: 580,
  asleepMinutes: 362,
  bedtime: "22:00",
  wakeUptime: "06:00",
  weeklyData: [
    { day: "Mon", percent: 6.5 },
    { day: "Tue", percent: 7.2 },
    { day: "Wed", percent: 8.0 },
    { day: "Thu", percent: 7.8 },
    { day: "Fri", percent: 6.0 },
    { day: "Sat", percent: 8.5 },
    { day: "Sun", percent: 7.0 },
  ],
};

// meditation checking
// Post API For

// 1. For reminder Time or preset
// 2. For sleep hours logged : 2,3 hours

// Get Response

export const meditationData = {
  goalMinutes: 30,
  completedMinutes: 10,
  weeklyData: [
    { label: "Mon", value: 80 },
    { label: "Tue", value: 160 },
    { label: "Wed", value: 220 },
    { label: "Thu", value: 180 },
    { label: "Fri", value: 260 },
    { label: "Sat", value: 240 },
    { label: "Sun", value: 190 },
  ],
};
