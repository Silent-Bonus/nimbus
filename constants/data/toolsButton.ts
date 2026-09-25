import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ROUTES } from "../routes";

export type NavigationButtonType = {
  id: number | string;
  label: string;
  action: string;
  screen: any;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const buttons: NavigationButtonType[] = [
  {
    id: 1,
    label: "Protocol Template",
    action: "navigate",
    screen: ROUTES.AUTH.TOOLS_PROTOCOL_TEMPLATES,
    iconName: "clipboard-text-outline",
  },
  {
    id: 2,
    label: "Articles",
    action: "navigate",
    screen: ROUTES.AUTH.TOOLS_ARTICLE_LIST,
    iconName: "newspaper-variant-outline",
  },
  {
    id: 3,
    label: "Recipe",
    action: "navigate",
    screen: ROUTES.AUTH.TOOLS_RECIPE,
    iconName: "silverware-fork-knife",
  },
  {
    id: 4,
    label: "Meal Planner",
    action: "navigate",
    screen: ROUTES.AUTH.TOOLS_MEAL_PLANNER,
    iconName: "calendar-heart",
  },
];
