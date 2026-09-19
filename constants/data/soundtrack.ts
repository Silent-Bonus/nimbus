export interface TrackType {
  id: string;
  slug?: string;
  title: string;
  name?: string; // Add optional name
  duration: string;
  durationLabel?: string; // Add optional durationLabel
  description: string;
  image: any; // Replace with actual image
  source: any; // Replace with actual audio file
  category: string;
  isLocked: boolean;
}

export const forYouTracks: TrackType[] = [
  {
    id: "1",
    title: "Rainstorm",
    duration: "61 min",
    image: require("../../assets/images/mentalTest/childhoodTrauma.png"), // Replace with actual image
    source: require("../../assets/dump/lightRain.mp3"),
    description:
      "Feeling unconditional love and acceptance towards yourself and the world",
    category: "All",
    isLocked: true,
  },
  {
    id: "16",
    title: "Seagul",
    duration: "3 min",
    image: require("../../assets/images/mentalTest/childhoodTrauma.png"), // Replace with actual image
    source: require("../../assets/dump/lightRain.mp3"), // Replace with actual audio file
    category: "All",
    description:
      "Feeling unconditional love and acceptance towards yourself and the world",
    isLocked: true,
  },
];
