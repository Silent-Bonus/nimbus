import type { TrackType } from "@/constants/data/soundtrack";
import type {
  WellnessContentBenefit,
  WellnessContentDetailItem,
  WellnessContentItem,
  WellnessContentResponse,
} from "@/features/self-care/types/wellnessContentTypes";

// Soundscape mappers always need the list payload shape and may receive
// detail-only fields when a detail response is normalized through the same path.
export type SoundscapeContentItem = WellnessContentItem &
  Partial<
    Pick<
      WellnessContentDetailItem,
      "audio" | "benefits" | "guidance" | "longDescription"
    >
  >;

export type SoundscapeListInput =
  | WellnessContentResponse
  | SoundscapeContentItem[]
  | null
  | undefined;

// Soundscape UI type consumed by screen, player, and cache flows.
export type SoundscapeTrack = TrackType & {
  durationLabel: string;
  tags: string[];
  filterTags: string[];
  frequencyHz: number | null;
  rating?: number;
  moodLabel?: string;
  longDescription?: string;
  benefits?: WellnessContentBenefit[];
};
