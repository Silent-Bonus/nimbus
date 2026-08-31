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
  //done
  {
    id: 1,
    label: "Zen",
    action: "navigate",
    screen: ROUTES.AUTH.SELF_CARE_MEDITATION,
    iconName: "meditation",
  },
  // done
  {
    id: 2,
    label: "Move",
    action: "navigate",
    screen: ROUTES.AUTH.SELF_CARE_WORKOUT,
    iconName: "dumbbell",
  },
  //done
  {
    id: 3,
    label: "Sonic",
    action: "navigate",
    screen: ROUTES.AUTH.SELF_CARE_SOUNDSCAPE,
    iconName: "music-circle-outline",
  },
  // done
  {
    id: 4,
    label: "Reflect",
    action: "navigate",
    screen: ROUTES.AUTH.SELF_CARE_REFLECTIONS,
    iconName: "book-open-variant",
  },
  // {
  //   id: 5,
  //   label: "Action",
  //   action: "modal",
  //   screen: "thingsToDo",
  //   iconName: "check-circle-outline",
  // },
];
