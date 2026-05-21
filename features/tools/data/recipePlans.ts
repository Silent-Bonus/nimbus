import type { ImageSourcePropType } from "react-native";
import type { ProtocolTemplateCardItem } from "@/features/tools/components/common/ProtocolTemplateCard";

export type RecipePlanNutrition = {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

export type RecipePlanTip = {
  key: string;
  title: string;
  description: string;
  icon: string;
};

export type RecipePlanDetail = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  filterKey: "Breakfast" | "Lunch" | "Dinner" | "Beverages" | "Snacks" | "Soup" | "Dessert" | "Sauce" | "NonVeg";
  image: ImageSourcePropType;
  imageFit?: "cover" | "contain";
  prepTime: string;
  calories: number;
  favorite: boolean;
  nutrition: RecipePlanNutrition;
  description: string;
  ingredients: string[];
  process: string[];
  tips: RecipePlanTip[];
  wisdomTitle: string;
  wisdom: string;
  ctaLabel: string;
};

export type RecipeCardItem = ProtocolTemplateCardItem & {
  id: string;
  favorite: boolean;
  raw: Record<string, any>;
};

const RECIPE_PLAN_DETAILS: RecipePlanDetail[] = [
  {
    id: "zesty-quinoa-bowl",
    title: "Zesty Quinoa Soul Bowl",
    subtitle: "Balanced & Energizing",
    category: "Lunch",
    filterKey: "Lunch",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
    prepTime: "18 min",
    calories: 420,
    favorite: true,
    nutrition: {
      calories: "420",
      protein: "18g",
      carbs: "52g",
      fats: "14g",
    },
    description:
      "A vibrant fusion of protein-rich quinoa, crisp garden greens, and a citrus-infused tahini nectar. This bowl is meticulously crafted to fuel your cellular energy while grounding your digestive fire with complex fibers and minerals.",
    ingredients: [
      "1 cup Organic Tri-color Quinoa",
      "2 cups Fresh Baby Spinach & Kale",
      "1/2 Avocado, sliced with intention",
      "Zest and Juice of 1 Organic Lemon",
      "2 tbsp Raw Tahini Dressing",
    ],
    process: [
      "Rinse the quinoa thoroughly under cold water to remove its natural coating, then simmer in filtered water until light and fluffy.",
      "Massage the kale with a drop of olive oil and lemon to soften the fibers, enhancing bio-availability of its nutrients.",
      "Whisk the tahini, lemon zest, and a pinch of sea salt into a velvet-smooth elixir. Drizzle over the assembled bowl.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Pair the bowl with lemon water or CCF tea to improve digestion and nutrient uptake.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Batch-cook quinoa for three days so the bowl stays under 5 minutes to assemble.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Add roasted tofu or salmon when you need a higher protein finish without changing the base.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "Quinoa is a rare plant-based complete protein, containing all nine essential amino acids. Paired with lemon juice, the Vitamin C significantly increases your body's absorption of the plant-based iron in the greens.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "matcha-overnight-oats",
    title: "Matcha Overnight Oats",
    subtitle: "Calm focus, slow release energy",
    category: "Breakfast",
    filterKey: "Breakfast",
    image: require("@/assets/images/bodyShape/1.png"),
    imageFit: "contain",
    prepTime: "10 min",
    calories: 320,
    favorite: true,
    nutrition: {
      calories: "320",
      protein: "16g",
      carbs: "36g",
      fats: "11g",
    },
    description:
      "Creamy oats whisked with ceremonial matcha and chia deliver a steady release of energy with a softer caffeine curve.",
    ingredients: [
      "1 cup rolled oats",
      "1 tbsp matcha",
      "2 tbsp chia seeds",
      "1 cup almond milk",
      "1 tsp honey",
    ],
    process: [
      "Combine oats, matcha, chia, and almond milk in a jar.",
      "Stir, seal, and refrigerate overnight.",
      "Top with seeds or berries before serving.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Add a pinch of cinnamon to blunt the glucose curve and support stable energy.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Prepare two jars at once so tomorrow's breakfast is already done.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Swap almond milk for kefir when you want extra protein and probiotics.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "The matcha-polyphenol blend supports focus without the sharp spike that usually follows a stronger brew.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "golden-tofu-stir-fry",
    title: "Golden Tofu Stir-fry",
    subtitle: "High protein and bright spice",
    category: "Dinner",
    filterKey: "Dinner",
    image: require("@/assets/images/bodyShape/2.png"),
    imageFit: "contain",
    prepTime: "22 min",
    calories: 365,
    favorite: true,
    nutrition: {
      calories: "365",
      protein: "24g",
      carbs: "28g",
      fats: "16g",
    },
    description:
      "A turmeric-forward stir-fry with crisp vegetables and golden tofu for a grounding dinner that still feels light.",
    ingredients: [
      "200g firm tofu",
      "1 cup broccoli florets",
      "1 red pepper",
      "1 tsp turmeric",
      "1 tbsp sesame oil",
    ],
    process: [
      "Sear tofu cubes until the edges are deeply golden.",
      "Toss vegetables with turmeric and sesame oil over high heat.",
      "Finish with lime and sesame seeds before serving.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Add black pepper with turmeric to support better curcumin absorption.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Use pre-cut vegetables to turn this into a 15-minute dinner.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Serve with brown rice if you want a more complete recovery meal.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "Combining soy protein with a bright acid finish keeps the meal satisfying without feeling heavy.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "almond-goji-mix",
    title: "Almond & Goji Mix",
    subtitle: "A quick, portable reset",
    category: "Snacks",
    filterKey: "Snacks",
    image: require("@/assets/images/bodyShape/3.png"),
    imageFit: "contain",
    prepTime: "5 min",
    calories: 180,
    favorite: false,
    nutrition: {
      calories: "180",
      protein: "6g",
      carbs: "14g",
      fats: "11g",
    },
    description:
      "A tiny snack assembly that brings together healthy fats, mineral-rich berries, and just enough sweetness.",
    ingredients: [
      "1/4 cup almonds",
      "2 tbsp goji berries",
      "1 tbsp pumpkin seeds",
      "Pinch of sea salt",
    ],
    process: [
      "Measure almonds, berries, and seeds into a bowl.",
      "Add a pinch of salt for mineral balance.",
      "Pack into a jar for the next craving window.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Pair it with water first if you want the snack to stay more satisfying.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Portion five snack bags at the start of the week.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Add cacao nibs for a slightly more energizing afternoon version.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "A small hit of fat and fiber can reset appetite signaling between larger meals.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "ccf-ginger-tea",
    title: "CCF Ginger Tea",
    subtitle: "Warm, digestively supportive brew",
    category: "Beverages",
    filterKey: "Beverages",
    image: require("@/assets/images/loginLatest.png"),
    imageFit: "contain",
    prepTime: "8 min",
    calories: 45,
    favorite: true,
    nutrition: {
      calories: "45",
      protein: "1g",
      carbs: "9g",
      fats: "0g",
    },
    description:
      "A light digestive tea that keeps the system hydrated while smoothing out the edges of a busy day.",
    ingredients: [
      "1 tsp cumin seeds",
      "1 tsp coriander seeds",
      "1 tsp fennel seeds",
      "Fresh ginger",
      "2 cups water",
    ],
    process: [
      "Simmer all seeds and ginger in water for 6 to 8 minutes.",
      "Strain into a warm mug.",
      "Sip slowly after meals or between long work blocks.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Drink warm, not boiling, so the aromas stay intact and soothing.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Pre-mix the dry seeds in a jar for your whole week.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Make a double batch and keep the second mug in a thermos.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "CCF tea can be a gentle way to support digestion without pushing stimulation higher.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "cooling-carrot-soup",
    title: "Cooling Carrot Soup",
    subtitle: "Silky and grounding",
    category: "Soup",
    filterKey: "Soup",
    image: require("@/assets/images/bodyShape/4.png"),
    imageFit: "contain",
    prepTime: "15 min",
    calories: 210,
    favorite: false,
    nutrition: {
      calories: "210",
      protein: "5g",
      carbs: "28g",
      fats: "8g",
    },
    description:
      "Velvety carrot soup with a cooling finish that works well when you want comfort without heaviness.",
    ingredients: [
      "3 carrots",
      "1 small onion",
      "1 tbsp coconut oil",
      "1 cup stock",
      "A splash of cream",
    ],
    process: [
      "Sweat onion until translucent, then add carrots.",
      "Pour in stock and simmer until soft.",
      "Blend smooth and finish with herbs.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Finish with lemon zest to brighten the flavor and support iron uptake.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Roast the carrots in bulk and freeze the base in portions.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Blend in white beans if you want a more filling bowl.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "Root vegetables paired with a silky texture can feel grounding while remaining easy to digest.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "date-bliss-bites",
    title: "Date Bliss Bites",
    subtitle: "Small sweet finish",
    category: "Dessert",
    filterKey: "Dessert",
    image: require("@/assets/images/mt.jpg"),
    imageFit: "cover",
    prepTime: "12 min",
    calories: 275,
    favorite: true,
    nutrition: {
      calories: "275",
      protein: "5g",
      carbs: "34g",
      fats: "13g",
    },
    description:
      "Chewy bites built for a cleaner dessert close with dates, nuts, and a touch of spice.",
    ingredients: [
      "1 cup dates",
      "1/2 cup almonds",
      "1 tbsp cacao",
      "Pinch of cardamom",
    ],
    process: [
      "Pulse dates and nuts in a food processor.",
      "Roll into small bites and dust with cacao.",
      "Chill before serving.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Eat with a few roasted seeds to temper the sweetness curve.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Keep a batch in the freezer for a no-effort dessert.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Swap in walnuts when you want a richer texture.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "A small portion of naturally sweet fruit can end a meal without feeling processed or heavy.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "sesame-miso-sauce",
    title: "Sesame Miso Sauce",
    subtitle: "Umami anchor for bowls",
    category: "Sauce",
    filterKey: "Sauce",
    image: require("@/assets/images/bodyShape/1.png"),
    imageFit: "contain",
    prepTime: "7 min",
    calories: 95,
    favorite: false,
    nutrition: {
      calories: "95",
      protein: "3g",
      carbs: "8g",
      fats: "6g",
    },
    description:
      "A creamy sauce that gives grains and vegetables a deeper umami profile without overwhelming the bowl.",
    ingredients: [
      "1 tbsp white miso",
      "1 tbsp tahini",
      "1 tsp sesame oil",
      "1 tbsp lemon juice",
      "Warm water",
    ],
    process: [
      "Whisk miso, tahini, lemon, and sesame oil together.",
      "Add warm water until the sauce becomes pourable.",
      "Drizzle over bowls or roasted vegetables.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Keep the sauce slightly thin so it coats greens evenly.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Batch a small jar for the next three meals.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Add grated ginger if you want a sharper finish.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "A smart sauce can transform a meal without requiring another cooking pass.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "miso-glazed-salmon",
    title: "Miso Glazed Salmon",
    subtitle: "Omega rich and savory",
    category: "Non-Veg",
    filterKey: "NonVeg",
    image: require("@/assets/images/bodyShape/2.png"),
    imageFit: "contain",
    prepTime: "25 min",
    calories: 480,
    favorite: false,
    nutrition: {
      calories: "480",
      protein: "34g",
      carbs: "18g",
      fats: "24g",
    },
    description:
      "A protein-dense dinner that pairs fatty fish with a light glaze for a satisfying but balanced plate.",
    ingredients: [
      "1 salmon fillet",
      "1 tbsp miso",
      "1 tsp honey",
      "1 tsp soy sauce",
      "Sesame seeds",
    ],
    process: [
      "Mix miso, honey, and soy into a glaze.",
      "Brush over salmon and roast until just flaky.",
      "Finish with sesame seeds and herbs.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Pair with leafy greens to lighten the meal and improve balance.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Marinate the fish in the morning so dinner takes less than 15 minutes.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Swap the glaze for a simple lemon-soy finish when you need speed.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "This is a clean way to bring higher protein into the plan without leaning on heavy sides.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "citrus-avocado-toast",
    title: "Citrus Avocado Toast",
    subtitle: "Bright, creamy breakfast",
    category: "Breakfast",
    filterKey: "Breakfast",
    image: require("@/assets/images/loginLatest.png"),
    imageFit: "cover",
    prepTime: "8 min",
    calories: 255,
    favorite: false,
    nutrition: {
      calories: "255",
      protein: "7g",
      carbs: "24g",
      fats: "15g",
    },
    description:
      "A crisp, high-color toast with avocado, citrus, and seeds for a breakfast that feels clean and fast.",
    ingredients: [
      "2 slices sourdough",
      "1 ripe avocado",
      "Zest of 1 lime",
      "1 tbsp pumpkin seeds",
      "Pinch of flaky salt",
    ],
    process: [
      "Toast the bread until the edges are deeply golden.",
      "Mash avocado with lime zest and salt.",
      "Spread generously and finish with seeds and herbs.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Add a squeeze of lemon to keep the avocado flavor vivid and the meal lighter.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Pre-mix the avocado topping so the toast is ready in under five minutes.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Top with a soft egg if you need more protein in the morning.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "Healthy fat and fiber can make a small breakfast feel much more sustaining.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "mushroom-labneh-bowl",
    title: "Mushroom Labneh Grain Bowl",
    subtitle: "Savory, tangy, satisfying",
    category: "Lunch",
    filterKey: "Lunch",
    image: require("@/assets/images/bodyShape/4.png"),
    imageFit: "contain",
    prepTime: "20 min",
    calories: 390,
    favorite: true,
    nutrition: {
      calories: "390",
      protein: "21g",
      carbs: "41g",
      fats: "15g",
    },
    description:
      "A grain bowl layered with roasted mushrooms, cool labneh, and herbs for a more composed lunch profile.",
    ingredients: [
      "1 cup cooked grains",
      "1 cup mushrooms",
      "3 tbsp labneh",
      "Fresh parsley",
      "1 tsp olive oil",
    ],
    process: [
      "Roast or pan-sear the mushrooms until browned.",
      "Spoon grains into a bowl and add the labneh.",
      "Finish with herbs, oil, and cracked pepper.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Keep the grains warm so the labneh softens into the base.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Use leftover grains to cut the prep time in half.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Swap labneh for hummus when you want a dairy-free version.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "Pairing creamy and savory elements makes the bowl feel composed without extra complexity.",
    ctaLabel: "Add to Meal Plan",
  },
  {
    id: "coconut-ginger-soup",
    title: "Coconut Ginger Soup",
    subtitle: "Warm, soothing, and light",
    category: "Soup",
    filterKey: "Soup",
    image: require("@/assets/images/bodyShape/3.png"),
    imageFit: "contain",
    prepTime: "16 min",
    calories: 230,
    favorite: false,
    nutrition: {
      calories: "230",
      protein: "4g",
      carbs: "20g",
      fats: "13g",
    },
    description:
      "A silky coconut broth with ginger and herbs that works well when you want a restorative lunch or early dinner.",
    ingredients: [
      "1 cup coconut milk",
      "1 tsp grated ginger",
      "1 clove garlic",
      "1 cup broth",
      "Fresh cilantro",
    ],
    process: [
      "Simmer garlic and ginger in a little oil until fragrant.",
      "Add broth and coconut milk, then warm gently.",
      "Finish with herbs and a squeeze of citrus.",
    ],
    tips: [
      {
        key: "bio-hacker",
        title: "Bio Hacker",
        description:
          "Add turmeric to the broth for a more anti-inflammatory finish.",
        icon: "pulse-outline",
      },
      {
        key: "fasttrack",
        title: "Fasttrack",
        description:
          "Keep the broth base in a jar so the soup is nearly instant.",
        icon: "flash-outline",
      },
      {
        key: "fastlane",
        title: "Fastlane",
        description:
          "Toss in pre-cooked noodles if you want a fuller meal.",
        icon: "rocket-outline",
      },
    ],
    wisdomTitle: "Nutritional Wisdom",
    wisdom:
      "A lighter soup can still feel complete when the broth, fat, and aromatics are balanced.",
    ctaLabel: "Add to Meal Plan",
  },
];

const buildRecipeCardItem = (detail: RecipePlanDetail): RecipeCardItem => ({
  id: detail.id,
  title: detail.title,
  image: detail.image,
  imageFit: detail.imageFit,
  favorite: detail.favorite,
  tags: [detail.category, detail.prepTime],
  raw: detail,
});

export const MOCK_RECIPE_ITEMS: RecipeCardItem[] =
  RECIPE_PLAN_DETAILS.map(buildRecipeCardItem);

export const getRecipePlanById = (id?: string | null) =>
  RECIPE_PLAN_DETAILS.find((item) => item.id === id) ?? null;

export const DEFAULT_RECIPE_PLAN = RECIPE_PLAN_DETAILS[0];
