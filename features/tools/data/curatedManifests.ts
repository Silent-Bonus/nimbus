import type { ImageSourcePropType } from "react-native";

export type ManifestDosha = "vata" | "pitta" | "kapha" | "neural-rec";

export type ManifestProtocolStep = {
  title: string;
  desc: string;
  frequency: string;
  context: string;
  duration: string;
  reminder_time: string;
};

export type CuratedManifest = {
  id: string;
  title: string;
  description: string;
  context: string;
  benefits: string[];
  category: string;
  dosha: ManifestDosha;
  protocols: ManifestProtocolStep[];
  tags: string[];
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviews: number;
  xp_reward: number;
};

export type ManifestFilter = {
  label: string;
  value: "all" | ManifestDosha;
};

export const MANIFEST_FILTERS: ManifestFilter[] = [
  { label: "All", value: "all" },
  { label: "Vata", value: "vata" },
  { label: "Pitta", value: "pitta" },
  { label: "Kapha", value: "kapha" },
  { label: "Neural Rec", value: "neural-rec" },
];

export const CURATED_MANIFESTS: CuratedManifest[] = [
  {
    id: "agni-reset",
    title: "The Agni Reset (Foundational)",
    description:
      "A comprehensive protocol designed to rekindle your digestive fire and clear metabolic sludge.",
    context:
      "For post-meal lethargy, morning heaviness, and a sluggish digestive rhythm.",
    benefits: [
      "Elimination of morning brain fog and sluggishness",
      "Enhanced nutrient absorption and metabolic rate",
      "Reduction in systemic inflammation and bloating",
      "Regulated and efficient bowel movements",
    ],
    category: "Gut Health",
    dosha: "pitta",
    protocols: [
      {
        title: "Tongue Scraping",
        desc: "Use a copper or stainless steel scraper to clear ama first thing in the morning.",
        frequency: "Daily",
        context: "Morning Hygiene",
        duration: "2 min",
        reminder_time: "07:00",
      },
      {
        title: "Ginger + Rock Salt Priming",
        desc: "Chew a thin slice of fresh ginger with a pinch of rock salt before your largest meal.",
        frequency: "Daily",
        context: "Pre-lunch Agni Boost",
        duration: "5 min",
        reminder_time: "12:45",
      },
      {
        title: "CCF Tea Infusion",
        desc: "Sip cumin, coriander, and fennel tea through the afternoon.",
        frequency: "Daily",
        context: "Digestive Support",
        duration: "10 min",
        reminder_time: "14:00",
      },
    ],
    tags: ["12 Rituals", "Pitta"],
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
    level: "Beginner",
    rating: 4.9,
    reviews: 128,
    xp_reward: 240,
  },
  {
    id: "mmc-sweep",
    title: "The MMC Sweep (Bio-Hacker's Choice)",
    description:
      "A strategic protocol to activate the migrating motor complex and clear the gut between meals.",
    context:
      "Designed to reduce bloating, support cleaner fasting windows, and improve appetite signaling.",
    benefits: [
      "Prevention of small intestinal bacterial overgrowth",
      "Reduction in unexplained bloating",
      "Improved mental clarity after meals",
      "Optimized hunger and satiety signaling",
    ],
    category: "Gut Health",
    dosha: "vata",
    protocols: [
      {
        title: "16:8 Fasting Window",
        desc: "Consume all calories within an 8-hour window.",
        frequency: "Daily",
        context: "Metabolic Foundation",
        duration: "8 hours",
        reminder_time: "20:00",
      },
      {
        title: "Strict Inter-Prandial Fasting",
        desc: "No snacking between meals to let cleaning waves complete.",
        frequency: "Mon-Fri",
        context: "Inter-meal Cleaning",
        duration: "4-5 hours",
        reminder_time: "15:30",
      },
      {
        title: "Non-Caloric Hydration Only",
        desc: "Stick to water, black coffee, or plain tea during the fast.",
        frequency: "Daily",
        context: "Fasting Integrity",
        duration: "All day",
        reminder_time: "09:00",
      },
    ],
    tags: ["7 Rituals", "Vata"],
    image: require("@/assets/images/bodyShape/1.png"),
    imageFit: "contain",
    level: "Advanced",
    rating: 4.8,
    reviews: 86,
    xp_reward: 180,
  },
  {
    id: "microbiome-garden",
    title: "The Microbiome Garden",
    description:
      "A biodiversity-focused template for rotating fiber, fermented inputs, and plant diversity.",
    context:
      "For users who want to increase microbial diversity and support gut-brain resilience.",
    benefits: [
      "Increased microbial diversity",
      "Natural production of short-chain fatty acids",
      "Improved serotonin and GABA production",
      "Enhanced resilience to food sensitivities",
    ],
    category: "Gut Health",
    dosha: "kapha",
    protocols: [
      {
        title: "30-Plant Challenge",
        desc: "Track and consume 30 different plant species each week.",
        frequency: "Daily",
        context: "Diversity Tracking",
        duration: "7 days",
        reminder_time: "18:00",
      },
      {
        title: "Fermented Micro-Dosing",
        desc: "Add sauerkraut, kimchi, or kefir to lunch.",
        frequency: "Daily",
        context: "Probiotic Inoculation",
        duration: "5 min",
        reminder_time: "13:00",
      },
      {
        title: "Resistant Starch Prep",
        desc: "Cook and cool potatoes or rice to feed lower-gut bacteria.",
        frequency: "3x Weekly",
        context: "Colonic Fuel",
        duration: "20 min",
        reminder_time: "19:30",
      },
    ],
    tags: ["9 Rituals", "Kapha"],
    image: require("@/assets/images/bodyShape/2.png"),
    imageFit: "contain",
    level: "Beginner",
    rating: 4.7,
    reviews: 112,
    xp_reward: 210,
  },
  {
    id: "vagus-gut",
    title: "The Vagus-Gut Connection",
    description:
      "A calming protocol to tone the vagus nerve and shift the system into rest-and-digest.",
    context:
      "Useful when stress shows up as cramping, acidity, or a locked-up digestive rhythm.",
    benefits: [
      "Reduction in stress-induced stomach cramps",
      "Improved secretion of digestive enzymes",
      "Better nutrient partitioning and metabolic flexibility",
      "Lower baseline cortisol over time",
    ],
    category: "Neuro Hacking",
    dosha: "neural-rec",
    protocols: [
      {
        title: "Box Breathing",
        desc: "Inhale, hold, exhale, and hold for 4 seconds each before your first bite.",
        frequency: "Daily",
        context: "Parasympathetic Trigger",
        duration: "3 min",
        reminder_time: "12:55",
      },
      {
        title: "Cold Face Plunge",
        desc: "Splash ice-cold water on the face for 30 seconds to trigger the dive reflex.",
        frequency: "Daily",
        context: "Nervous System Reset",
        duration: "30 sec",
        reminder_time: "07:30",
      },
      {
        title: "No-Screen Dining",
        desc: "Eat without a phone, laptop, or TV so the senses stay with the meal.",
        frequency: "Daily",
        context: "Sensory Presence",
        duration: "Meal duration",
        reminder_time: "13:00",
      },
    ],
    tags: ["8 Rituals", "Neural Rec"],
    image: require("@/assets/images/bodyShape/3.png"),
    imageFit: "contain",
    level: "Intermediate",
    rating: 4.9,
    reviews: 154,
    xp_reward: 260,
  },
  {
    id: "gut-lining-shield",
    title: "The Gut-Lining Shield",
    description:
      "A higher-intervention template to support intestinal barrier repair and reduce inflammation.",
    context:
      "Built for users who need a stronger repair phase and more structural support.",
    benefits: [
      "Reduced systemic inflammation",
      "Improved skin clarity",
      "Higher tolerance to diverse food groups",
      "Stabilized immune response",
    ],
    category: "Gut Health",
    dosha: "kapha",
    protocols: [
      {
        title: "L-Glutamine Loading",
        desc: "Take L-glutamine or collagen in warm water to support the gut lining.",
        frequency: "Daily",
        context: "Structural Repair",
        duration: "5 min",
        reminder_time: "08:00",
      },
      {
        title: "The 30-Chew Rule",
        desc: "Chew each bite until it reaches a liquid consistency.",
        frequency: "Daily",
        context: "Mechanical Sparing",
        duration: "Per meal",
        reminder_time: "13:00",
      },
      {
        title: "Trigger Elimination Check",
        desc: "Remove one inflammatory trigger food for the day.",
        frequency: "Daily",
        context: "Barrier Protection",
        duration: "1 day",
        reminder_time: "20:00",
      },
    ],
    tags: ["10 Rituals", "Kapha"],
    image: require("@/assets/images/bodyShape/3.png"),
    imageFit: "contain",
    level: "Intermediate",
    rating: 4.8,
    reviews: 98,
    xp_reward: 230,
  },
  {
    id: "dopamine-baseline",
    title: "The Dopamine Baseline",
    description:
      "A foundational protocol to protect motivation from overstimulation and rebuild deep focus.",
    context:
      "Designed for people who want better attention, calmer mornings, and less reactive scrolling.",
    benefits: [
      "Increased sustained attention span",
      "Restored natural motivation for long-term goals",
      "Stabilized mood and reduced morning anxiety",
      "Improved morning alertness without immediate screen reliance",
    ],
    category: "Neuro Hacking",
    dosha: "neural-rec",
    protocols: [
      {
        title: "No-Phone First Hour",
        desc: "Keep the phone in another room for the first hour after waking.",
        frequency: "Daily",
        context: "Anti-Reactive Morning",
        duration: "60 min",
        reminder_time: "07:00",
      },
      {
        title: "Morning Sunlight",
        desc: "Get natural light within 30 minutes of waking.",
        frequency: "Daily",
        context: "Circadian Signaling",
        duration: "10 min",
        reminder_time: "07:30",
      },
      {
        title: "Deep Work Sprint",
        desc: "Work 45-90 minutes with zero notifications.",
        frequency: "Mon-Fri",
        context: "Focus Training",
        duration: "45-90 min",
        reminder_time: "10:00",
      },
    ],
    tags: ["6 Rituals", "Neural Rec"],
    image: require("@/assets/images/onboarding.png"),
    imageFit: "contain",
    level: "Advanced",
    rating: 4.9,
    reviews: 203,
    xp_reward: 300,
  },
  {
    id: "circadian-anchor",
    title: "The Circadian Anchor",
    description:
      "A vata-friendly rhythm template that stabilizes wake time, light exposure, and evening wind-down.",
    context:
      "Useful when the day feels noisy, the sleep cycle drifts, and the nervous system wants structure.",
    benefits: [
      "More consistent wake time",
      "Smoother evening downshift",
      "Cleaner energy curves across the day",
      "Better sleep onset consistency",
    ],
    category: "Neuro Hacking",
    dosha: "vata",
    protocols: [
      {
        title: "Sunrise Light Walk",
        desc: "Spend 10 minutes outside within the first hour of waking.",
        frequency: "Daily",
        context: "Morning Anchor",
        duration: "10 min",
        reminder_time: "07:15",
      },
      {
        title: "Digital Sunset",
        desc: "Reduce screens 90 minutes before bed and lower the room light.",
        frequency: "Daily",
        context: "Evening Wind-Down",
        duration: "90 min",
        reminder_time: "20:30",
      },
      {
        title: "Anchor Meal Timing",
        desc: "Keep the first and last meals close to the same time each day.",
        frequency: "Daily",
        context: "Rhythm Stabilization",
        duration: "Daily",
        reminder_time: "18:30",
      },
    ],
    tags: ["5 Rituals", "Vata"],
    image: require("@/assets/images/bodyShape/4.png"),
    imageFit: "contain",
    level: "Beginner",
    rating: 4.6,
    reviews: 72,
    xp_reward: 170,
  },
  {
    id: "rest-digest",
    title: "Rest + Digest Plate",
    description:
      "A soft landing protocol that reduces friction around meals and encourages parasympathetic ease.",
    context:
      "Helpful for people who eat fast, stay tense at meals, or need a gentler digestion cue.",
    benefits: [
      "Less tension at meals",
      "Gentler digestion support",
      "More consistent post-meal calm",
      "Improved breathing awareness around eating",
    ],
    category: "Gut Health",
    dosha: "pitta",
    protocols: [
      {
        title: "Before-Meal Breathing",
        desc: "Take three slow breaths before the first bite.",
        frequency: "Daily",
        context: "Pre-Meal Reset",
        duration: "1 min",
        reminder_time: "12:50",
      },
      {
        title: "Left-Side Rest",
        desc: "Lie on the left side for 10 minutes after dinner.",
        frequency: "Daily",
        context: "Anatomic Support",
        duration: "10 min",
        reminder_time: "20:30",
      },
      {
        title: "Warm Water Close",
        desc: "End the evening with a warm cup of water or herbal tea.",
        frequency: "Daily",
        context: "Soothing Close",
        duration: "5 min",
        reminder_time: "21:15",
      },
    ],
    tags: ["4 Rituals", "Pitta"],
    image: require("@/assets/images/bodyShape/5.png"),
    imageFit: "contain",
    level: "Beginner",
    rating: 4.7,
    reviews: 64,
    xp_reward: 150,
  },
];

export const getCuratedManifestById = (id?: string | null) =>
  CURATED_MANIFESTS.find((item) => item.id === id) ?? null;
