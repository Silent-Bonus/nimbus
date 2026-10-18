import type { ImageSourcePropType } from "react-native";

export type WorkoutGuideLevel = "easy" | "medium" | "hard";

export interface WorkoutGuideSlide {
  id: string;
  image: ImageSourcePropType;
}

export interface WorkoutGuideLevelContent {
  level: WorkoutGuideLevel;
  summary: string;
  howTo: readonly string[];
  posture: readonly string[];
  slides: readonly WorkoutGuideSlide[];
}

const WORKOUT_EASY_1 = require("../../../assets/images/workout/squats/1/squats-frame-1.png");
const WORKOUT_EASY_2 = require("../../../assets/images/workout/squats/1/squats-frame-2.png");
const WORKOUT_EASY_3 = require("../../../assets/images/workout/squats/1/squats-frame-3.png");
const WORKOUT_EASY_4 = require("../../../assets/images/workout/squats/1/squats-frame-4.png");
const WORKOUT_EASY_5 = require("../../../assets/images/workout/squats/1/squats-frame-5.png");
const WORKOUT_EASY_6 = require("../../../assets/images/workout/squats/1/squats-frame-6.png");
const WORKOUT_EASY_7 = require("../../../assets/images/workout/squats/1/squats-frame-7.png");

const WORKOUT_MEDIUM_1 = require("../../../assets/images/mt.jpg");
const WORKOUT_MEDIUM_2 = require("../../../assets/images/mt.jpg");
const WORKOUT_MEDIUM_3 = require("../../../assets/images/mt.jpg");
const WORKOUT_MEDIUM_4 = require("../../../assets/images/mt.jpg");
const WORKOUT_MEDIUM_5 = require("../../../assets/images/mt.jpg");
const WORKOUT_MEDIUM_6 = require("../../../assets/images/mt.jpg");

const WORKOUT_HARD_1 = require("../../../assets/images/mt.jpg");
const WORKOUT_HARD_2 = require("../../../assets/images/mt.jpg");
const WORKOUT_HARD_3 = require("../../../assets/images/mt.jpg");
const WORKOUT_HARD_4 = require("../../../assets/images/mt.jpg");
const WORKOUT_HARD_5 = require("../../../assets/images/mt.jpg");
const WORKOUT_HARD_6 = require("../../../assets/images/mt.jpg");

const createGuide = (
  level: WorkoutGuideLevel,
  summary: string,
  slides: readonly WorkoutGuideSlide[],
  howTo: readonly string[],
  posture: readonly string[]
): WorkoutGuideLevelContent => ({
  level,
  summary,
  slides,
  howTo,
  posture,
});

export const mockWorkoutGuideLevels: Record<WorkoutGuideLevel, WorkoutGuideLevelContent> =
  {
    easy: createGuide(
      "easy",
      "Foundational bodyweight control with a clean vertical line.",
      [
        { id: "easy-1", image: WORKOUT_EASY_1 },
        { id: "easy-2", image: WORKOUT_EASY_2 },
        { id: "easy-3", image: WORKOUT_EASY_3 },
        { id: "easy-4", image: WORKOUT_EASY_4 },
        { id: "easy-5", image: WORKOUT_EASY_5 },
        { id: "easy-6", image: WORKOUT_EASY_6 },
        { id: "easy-7", image: WORKOUT_EASY_7 },
      ],
      [
        "Stand with feet grounded and spine long.",
        "Lower under control while the knees track over the toes.",
        "Return with a quiet exhale and a steady gaze.",
      ],
      [
        "Keep the neck long and the jaw relaxed.",
        "Stack the ribs lightly over the pelvis.",
        "Share weight evenly across both feet.",
      ]
    ),
    medium: createGuide(
      "medium",
      "A steadier rhythm with more depth and engagement.",
      [
        { id: "medium-1", image: WORKOUT_MEDIUM_1 },
        { id: "medium-2", image: WORKOUT_MEDIUM_2 },
        { id: "medium-3", image: WORKOUT_MEDIUM_3 },
        { id: "medium-4", image: WORKOUT_MEDIUM_4 },
        { id: "medium-5", image: WORKOUT_MEDIUM_5 },
        { id: "medium-6", image: WORKOUT_MEDIUM_6 },
      ],
      [
        "Stand tall and brace lightly before moving.",
        "Keep the core engaged as you travel into depth.",
        "Press back up through the heel and midfoot together.",
      ],
      [
        "Keep the shoulders relaxed but active.",
        "Track the knees in line with the toes.",
        "Stay long through the spine on every rep.",
      ]
    ),
    hard: createGuide(
      "hard",
      "Higher control demand with tighter bracing and balance.",
      [
        { id: "hard-1", image: WORKOUT_HARD_1 },
        { id: "hard-2", image: WORKOUT_HARD_2 },
        { id: "hard-3", image: WORKOUT_HARD_3 },
        { id: "hard-4", image: WORKOUT_HARD_4 },
        { id: "hard-5", image: WORKOUT_HARD_5 },
        { id: "hard-6", image: WORKOUT_HARD_6 },
      ],
      [
        "Set the stance with intent and keep the core active.",
        "Move slowly into the bottom position and hold the line.",
        "Return with precision, not speed.",
      ],
      [
        "Keep the chest open and the gaze steady.",
        "Avoid collapsing into the hips or the shoulders.",
        "Use the breath to stay calm through the load.",
      ]
    ),
  };

export const getWorkoutGuideLevelContent = (level: WorkoutGuideLevel) =>
  mockWorkoutGuideLevels[level];
