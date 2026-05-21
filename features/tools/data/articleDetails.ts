import type { ImageSourcePropType } from "react-native";

export type ArticleContextCard = {
  eyebrow: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  description: string;
};

export type ArticleReflectionPrompt = {
  eyebrow: string;
  title: string;
  prompt: string;
  helper: string;
  actionLabel: string;
};

export type ArticleRecommendation = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
};

export type ArticleDetail = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readingTime: string;
  authorName: string;
  authorRole: string;
  heroImage: ImageSourcePropType;
  heroImageFit?: "cover" | "contain";
  contextCard: ArticleContextCard;
  content: string[];
  pullQuote: string;
  reflectionPrompt: ArticleReflectionPrompt;
  recommendationLabel: string;
  recommendation: ArticleRecommendation;
  tags: string[];
  favorite: boolean;
  saveLabel: string;
};

type ArticleDetailSeed = Omit<ArticleDetail, "favorite" | "saveLabel" | "tags"> & {
  favorite?: boolean;
  saveLabel?: string;
  tags?: string[];
};

const buildArticleDetail = (seed: ArticleDetailSeed): ArticleDetail => ({
  ...seed,
  favorite: seed.favorite ?? false,
  saveLabel: seed.saveLabel ?? "Save",
  tags: seed.tags ?? [seed.category, seed.readingTime],
});

export const MOCK_ARTICLE_DETAILS: ArticleDetail[] = [
  buildArticleDetail({
    id: "101",
    title: "Synchronizing the Human Machine",
    subtitle: "Designed for the dawn and the dusk",
    category: "Chronobiology",
    readingTime: "8 min read",
    authorName: "Dr. Elena Thorne",
    authorRole: "Lead Chronobiologist",
    heroImage: require("@/assets/images/loginLatest.png"),
    heroImageFit: "cover",
    contextCard: {
      eyebrow: "Biometric Logic",
      primaryLabel: "Melatonin",
      primaryValue: "480nm Light",
      secondaryLabel: "Circadian Cue",
      secondaryValue: "Amber Sunset",
      description:
        "The body reads light as a timing signal. Blue-shifted light in the morning sharpens alertness, while warmer tones in the evening help the system unwind.",
    },
    content: [
      "Before synthetic luminance, biology was dictated by the sky. Dawn and dusk were the original cues that taught the human operating system when to rise, focus, and slow down.",
      "The nervous system still responds first to light. When the first hour of the day is brighter and cleaner, and the last hour is softer and warmer, the body gets a clearer rhythm to follow.",
      "The goal is not more control. It is better timing, so energy arrives when you need it and recovery starts before you are already depleted.",
    ],
    pullQuote:
      "The body does not need more pressure. It needs better timing.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Initialize Biological Scan",
      prompt:
        "What is the first light your body receives, and what is the last light it consumes?",
      helper:
        "Take 30 seconds and write one small change you could make to either side of the day.",
      actionLabel: "Execute Sync",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "109",
      title: "Molecular Fasting: The Cellular Purge",
      subtitle: "Next up",
      tag: "Bio-hack · 9 min read",
      image: require("@/assets/images/bodyShape/5.png"),
      imageFit: "contain",
    },
    favorite: true,
  }),
  buildArticleDetail({
    id: "102",
    title: "Ashwagandha Timing Guide",
    subtitle: "A calmer adaptation window",
    category: "Herbs",
    readingTime: "6 min read",
    authorName: "Mira Sethi",
    authorRole: "Herbal Systems Editor",
    heroImage: require("@/assets/images/bodyShape/1.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Herbal Timing",
      primaryLabel: "Adaptogen",
      primaryValue: "Evening Window",
      secondaryLabel: "Best Pairing",
      secondaryValue: "Warm Milk",
      description:
        "Ashwagandha tends to behave like a timing tool as much as a tonic. The effect changes when you pair it with sleep, stress, or workout recovery.",
    },
    content: [
      "Adaptogens are not one-size-fits-all. They are more like timing levers that can either support a calm nervous system or feel unhelpful if used at the wrong point in the day.",
      "The easiest way to understand ashwagandha is to treat it as an evening anchor, especially when the body feels overclocked and the mind keeps replaying the day.",
    ],
    pullQuote:
      "A herb can be powerful, but its timing decides the quality of the effect.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Map Your Stress Window",
      prompt:
        "When does your system feel most overextended, and could an evening anchor help?",
      helper: "Write one sentence about the time of day your body feels the loudest.",
      actionLabel: "Note Timing",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "103",
      title: "The 4-Minute Breath Reset",
      subtitle: "Next up",
      tag: "Mindfulness · 5 min read",
      image: require("@/assets/images/bodyShape/2.png"),
      imageFit: "contain",
    },
    favorite: false,
  }),
  buildArticleDetail({
    id: "103",
    title: "The 4-Minute Breath Reset",
    subtitle: "A fast nervous system reset",
    category: "Meditation",
    readingTime: "5 min read",
    authorName: "Ari Kaul",
    authorRole: "Breathwork Coach",
    heroImage: require("@/assets/images/bodyShape/2.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Resonance Cue",
      primaryLabel: "Exhale",
      primaryValue: "Longer Than Inhale",
      secondaryLabel: "Range",
      secondaryValue: "4 Minutes",
      description:
        "A short breath reset lowers the volume on the stress response without demanding a full meditation session or a long setup.",
    },
    content: [
      "The quickest way to interrupt a busy nervous system is not with more thought. It is with a change in rhythm that the body can feel immediately.",
      "A four-minute reset is enough to create that shift: slow the inhale, lengthen the exhale, and let the body register a new cadence.",
    ],
    pullQuote:
      "Breath is the smallest change that can create the biggest perceptible shift.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Interrupt the Spiral",
      prompt:
        "Which moment in your day could use a 4-minute reset before the next task begins?",
      helper: "Notice whether your shoulders, jaw, or stomach change after one round.",
      actionLabel: "Start Reset",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "104",
      title: "Epigenetics of Sleep Debt",
      subtitle: "Next up",
      tag: "Research note · 11 min read",
      image: require("@/assets/images/bodyShape/3.png"),
      imageFit: "contain",
    },
    favorite: true,
  }),
  buildArticleDetail({
    id: "104",
    title: "Epigenetics of Sleep Debt",
    subtitle: "How late nights echo forward",
    category: "Epigenetics",
    readingTime: "11 min read",
    authorName: "Dr. Noor Vance",
    authorRole: "Molecular Health Researcher",
    heroImage: require("@/assets/images/bodyShape/3.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Gene Expression",
      primaryLabel: "Sleep Loss",
      primaryValue: "Inflammation",
      secondaryLabel: "Recovery Lever",
      secondaryValue: "Morning Light",
      description:
        "Late nights do not just make you tired. They also shape the signals your cells read the next day, which is why recovery must begin with the next morning, not the next weekend.",
    },
    content: [
      "Sleep debt is more than a feeling. It creates an environment where stress signaling, appetite cues, and energy use all shift in subtle but meaningful ways.",
      "The good news is that the system is responsive. Consistent wake times, morning light, and earlier meals can help flatten the debt faster than dramatic compensations.",
    ],
    pullQuote:
      "Recovery is built by the next signal, not by regret about the last one.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Audit Your Recovery",
      prompt:
        "What is one habit that quietly steals sleep, and what is the earliest correction you could make?",
      helper: "Keep the answer practical and small enough to test tonight.",
      actionLabel: "Review Pattern",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "105",
      title: "Neuroplasticity and Repetition",
      subtitle: "Next up",
      tag: "Focus note · 7 min read",
      image: require("@/assets/images/bodyShape/4.png"),
      imageFit: "contain",
    },
    favorite: false,
  }),
  buildArticleDetail({
    id: "105",
    title: "Neuroplasticity and Repetition",
    subtitle: "Why tiny repetitions matter",
    category: "Neuroplasticity",
    readingTime: "7 min read",
    authorName: "Leah Arden",
    authorRole: "Behavior Design Lead",
    heroImage: require("@/assets/images/bodyShape/4.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Learning Loop",
      primaryLabel: "Signal",
      primaryValue: "Repetition",
      secondaryLabel: "Outcome",
      secondaryValue: "Myelin",
      description:
        "The brain changes less from intensity than from reliable repetition. Small actions repeated under the same conditions create the fastest structural memory.",
    },
    content: [
      "Neuroplasticity is not about becoming a different person overnight. It is about teaching the brain which patterns deserve to become automatic.",
      "When a behavior is repeated in the same time, place, or emotional state, the brain begins to predict it, and prediction is where change starts to feel effortless.",
    ],
    pullQuote:
      "Repetition is the architecture. Intensity is only the spark.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Find the Loop",
      prompt:
        "What one action would become easier if you repeated it in the same place every day?",
      helper: "Choose something small enough to survive a low-energy day.",
      actionLabel: "Design Loop",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "106",
      title: "Polyphenols for Recovery",
      subtitle: "Next up",
      tag: "Nutrition · 9 min read",
      image: require("@/assets/images/bodyShape/5.png"),
      imageFit: "contain",
    },
    favorite: true,
  }),
  buildArticleDetail({
    id: "106",
    title: "Polyphenols for Recovery",
    subtitle: "The antioxidant layer",
    category: "Herbs",
    readingTime: "9 min read",
    authorName: "Mira Sethi",
    authorRole: "Herbal Systems Editor",
    heroImage: require("@/assets/images/bodyShape/5.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Plant Chemistry",
      primaryLabel: "Polyphenols",
      primaryValue: "Recovery",
      secondaryLabel: "Pairing",
      secondaryValue: "Berries + Herbs",
      description:
        "Polyphenol-rich foods can support the recovery phase by shaping how the body handles oxidative stress and inflammation after effort.",
    },
    content: [
      "Recovery is not only about protein and rest. It also benefits from colorful plant compounds that help buffer the stress created by training, poor sleep, or long workdays.",
      "Berries, herbs, tea, and deeply colored vegetables bring a different kind of support: one that helps the body settle back toward equilibrium.",
    ],
    pullQuote:
      "Recovery becomes easier when your plate carries more color than stress.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Add Color Back In",
      prompt:
        "Which part of your day could use a recovery food instead of a convenience snack?",
      helper: "Think in terms of a single swap rather than a full meal overhaul.",
      actionLabel: "Plan Swap",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "107",
      title: "Meditation Before Meals",
      subtitle: "Next up",
      tag: "Mindfulness · 4 min read",
      image: require("@/assets/images/bodyShape/6.png"),
      imageFit: "contain",
    },
    favorite: true,
  }),
  buildArticleDetail({
    id: "107",
    title: "Meditation Before Meals",
    subtitle: "A quiet transition ritual",
    category: "Mindfulness",
    readingTime: "4 min read",
    authorName: "Ari Kaul",
    authorRole: "Breathwork Coach",
    heroImage: require("@/assets/images/bodyShape/6.png"),
    heroImageFit: "contain",
    contextCard: {
      eyebrow: "Meal State",
      primaryLabel: "Pause",
      primaryValue: "3 Breaths",
      secondaryLabel: "Effect",
      secondaryValue: "Less Reactivity",
      description:
        "A short pause before eating can soften the edge of stress and make the first bites feel more intentional and settled.",
    },
    content: [
      "Most meals begin while the mind is still somewhere else. A pause creates enough separation to notice hunger, pace, and the quality of the moment before the first bite.",
      "The ritual does not need to be formal. Three breaths, one exhale that is a little longer than the inhale, and a simple thank-you is often enough.",
    ],
    pullQuote:
      "A meal can nourish more deeply when the nervous system arrives before the fork.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Pause Before the Plate",
      prompt:
        "What would change if your first three breaths became part of every meal?",
      helper: "Try the ritual once today and notice whether the meal feels different.",
      actionLabel: "Try Pause",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "108",
      title: "Light Exposure and Dopamine",
      subtitle: "Next up",
      tag: "Research note · 10 min read",
      image: require("@/assets/images/mt.jpg"),
      imageFit: "cover",
    },
    favorite: false,
  }),
  buildArticleDetail({
    id: "108",
    title: "Light Exposure and Dopamine",
    subtitle: "How light shapes reward and drive",
    category: "Epigenetics",
    readingTime: "10 min read",
    authorName: "Dr. Elena Thorne",
    authorRole: "Lead Chronobiologist",
    heroImage: require("@/assets/images/mt.jpg"),
    heroImageFit: "cover",
    contextCard: {
      eyebrow: "Signal Layer",
      primaryLabel: "Morning",
      primaryValue: "Dopamine",
      secondaryLabel: "Evening",
      secondaryValue: "Downshift",
      description:
        "Light exposure is not only about sleep. It also helps shape reward, focus, and the energy curve the brain runs on throughout the day.",
    },
    content: [
      "Morning light helps set the tempo for alertness and motivation. It gives the brain a stronger signal that the day has started and that action is appropriate.",
      "As the day closes, softer light helps the system transition away from pursuit and into restoration. That balance keeps the reward system from running too hot for too long.",
    ],
    pullQuote:
      "The most powerful light is the one that arrives at the right time.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Audit Your Light",
      prompt:
        "Where in your day is light helping you focus, and where is it keeping you too switched on?",
      helper: "Note one place where a small dimming ritual could help you land the day.",
      actionLabel: "Audit Light",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "101",
      title: "Synchronizing the Human Machine",
      subtitle: "Next up",
      tag: "Chronobiology · 8 min read",
      image: require("@/assets/images/loginLatest.png"),
      imageFit: "cover",
    },
    favorite: false,
  }),
  buildArticleDetail({
    id: "109",
    title: "Molecular Fasting: The Cellular Purge",
    subtitle: "A cleaner fasting window",
    category: "Bio-hack",
    readingTime: "9 min read",
    authorName: "Noah Vale",
    authorRole: "Metabolic Analyst",
    heroImage: require("@/assets/images/result.jpg"),
    heroImageFit: "cover",
    contextCard: {
      eyebrow: "Metabolic Logic",
      primaryLabel: "Fast",
      primaryValue: "16:8",
      secondaryLabel: "Focus",
      secondaryValue: "Autophagy",
      description:
        "Fasting works best when it is used as a timing tool, not as a punishment. The body reads clear windows as a cue to clean up and reset.",
    },
    content: [
      "A fasting window can help reduce noise around hunger and sharpen the signals that tell the body when to repair and when to receive energy.",
      "The cleaner the window, the less friction the system has. Hydration, sleep, and a steady meal rhythm all make the fasting phase easier to sustain.",
    ],
    pullQuote:
      "A fast is not about scarcity. It is about giving the system a cleaner rhythm.",
    reflectionPrompt: {
      eyebrow: "Reflection Prompt",
      title: "Track the Window",
      prompt:
        "Where does your current meal rhythm feel noisy, and could a cleaner fasting window simplify it?",
      helper: "Keep the next experiment small enough to test for three days.",
      actionLabel: "Start Window",
    },
    recommendationLabel: "Continue Exploration",
    recommendation: {
      id: "102",
      title: "Ashwagandha Timing Guide",
      subtitle: "Next up",
      tag: "Herbs · 6 min read",
      image: require("@/assets/images/bodyShape/1.png"),
      imageFit: "contain",
    },
    favorite: false,
  }),
];

export const DEFAULT_ARTICLE_DETAIL = MOCK_ARTICLE_DETAILS[0];

export const getArticleDetailById = (id?: string | number | null) =>
  MOCK_ARTICLE_DETAILS.find((item) => String(item.id) === String(id));
