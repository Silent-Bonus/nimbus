import type { SessionFeedbackQuestion } from "../types";

export const FALLBACK_SESSION_FEEDBACK_QUESTIONS: SessionFeedbackQuestion[] = [
  {
    id: 1,
    order: 1,
    prefix: "How do you greet",
    accent: "the morning?",
    subtitle:
      "Select all the states that resonate with your recent waking experiences.",
    selectionMode: "multiple",
    layout: "list",
    options: [
      {
        id: "restless-foggy",
        label: "Restless & Foggy",
        subtitle: "Feeling unrefreshed and heavy.",
        icon: "cloud-outline",
      },
      {
        id: "deeply-restored",
        label: "Deeply Restored",
        subtitle: "Waking up energized and clear.",
        icon: "moon-outline",
      },
      {
        id: "short-fragmented",
        label: "Short & Fragmented",
        subtitle: "Tossing and turning frequently.",
        icon: "list-outline",
      },
      {
        id: "natural-rhythms",
        label: "Natural Rhythms",
        subtitle: "Aligned with the sun and moon.",
        icon: "water-outline",
      },
    ],
  },
  {
    id: 2,
    order: 2,
    prefix: "What feels most",
    accent: "present right now?",
    subtitle:
      "Choose the state that best describes your inner weather after the session.",
    selectionMode: "single",
    layout: "list",
    options: [
      {
        id: "calm-open",
        label: "Calm & Open",
        subtitle: "The room feels wider and less crowded.",
        icon: "sparkles-outline",
      },
      {
        id: "soft-focused",
        label: "Softly Focused",
        subtitle: "Attention is steady without strain.",
        icon: "compass-outline",
      },
      {
        id: "still-foggy",
        label: "Still Foggy",
        subtitle: "The edges are quieter, but not yet clear.",
        icon: "cloud-outline",
      },
      {
        id: "more-awake",
        label: "More Awake",
        subtitle: "There is a lift, but it still needs settling.",
        icon: "sunny-outline",
      },
    ],
  },
  {
    id: 3,
    order: 3,
    prefix: "Where do you feel",
    accent: "the shift most?",
    subtitle:
      "Pick the place where the session changes the most in your system.",
    selectionMode: "single",
    layout: "list",
    options: [
      {
        id: "head-thoughts",
        label: "Head & Thoughts",
        subtitle: "The mind gets quieter.",
        icon: "bulb-outline",
      },
      {
        id: "chest-breath",
        label: "Chest & Breath",
        subtitle: "Breathing feels roomier.",
        icon: "water-outline",
      },
      {
        id: "shoulders-jaw",
        label: "Shoulders & Jaw",
        subtitle: "Tension begins to soften.",
        icon: "scan-outline",
      },
      {
        id: "whole-body",
        label: "Whole Body",
        subtitle: "Everything feels a little more even.",
        icon: "leaf-outline",
      },
    ],
  },
  {
    id: 4,
    order: 4,
    prefix: "How do you want",
    accent: "the next hours to feel?",
    subtitle:
      "Choose the rhythm you want to carry forward after this session.",
    selectionMode: "single",
    layout: "list",
    options: [
      {
        id: "steady-clear",
        label: "Steady & Clear",
        subtitle: "A clean lane through the day.",
        icon: "compass-outline",
      },
      {
        id: "soft-restful",
        label: "Soft & Restful",
        subtitle: "Lower the volume everywhere.",
        icon: "moon-outline",
      },
      {
        id: "focused-bright",
        label: "Focused & Bright",
        subtitle: "One thing at a time, with ease.",
        icon: "scan-outline",
      },
      {
        id: "light-energized",
        label: "Light & Energized",
        subtitle: "A little more lift and movement.",
        icon: "sunny-outline",
      },
    ],
  },
  {
    id: 5,
    order: 5,
    prefix: "What intention will we",
    accent: "nurture?",
    subtitle: "Select the seeds you wish to plant for your journey ahead.",
    selectionMode: "multiple",
    layout: "grid",
    options: [
      {
        id: "clarity-of-mind",
        label: "Clarity of Mind",
        subtitle: "Thin the fog, find the light within.",
        icon: "bulb-outline",
      },
      {
        id: "physical-vitality",
        label: "Physical Vitality",
        subtitle: "Awaken the strength that sleeps.",
        icon: "barbell-outline",
      },
      {
        id: "soulful-rest",
        label: "Soulful Rest",
        subtitle: "Deep surrender to the quiet night.",
        icon: "moon-outline",
      },
      {
        id: "deep-focus",
        label: "Deep Focus",
        subtitle: "One point of light in the chaos.",
        icon: "scan-outline",
      },
    ],
  },
];

