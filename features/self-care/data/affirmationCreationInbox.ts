import type { AffirmationResolvedItem } from "@/features/self-care/types/affirmation";

let queuedCreatedAffirmation: AffirmationResolvedItem | null = null;

export const queueCreatedAffirmation = (item: AffirmationResolvedItem) => {
  queuedCreatedAffirmation = item;
};

export const consumeQueuedCreatedAffirmation = (): AffirmationResolvedItem | null => {
  const item = queuedCreatedAffirmation;
  queuedCreatedAffirmation = null;
  return item;
};

export const peekQueuedCreatedAffirmation = (): AffirmationResolvedItem | null =>
  queuedCreatedAffirmation;
