// src/components/selfCare/soundscape/SoundscapeFeaturedCard.tsx

import React from "react";
import NimbusUltraFeaturedCard from "@/components/layout/NimbusUltraFeaturedCard";
import type { EnrichedMeditation } from "@/features/self-care/types/wellnessContentTypes";

interface MeditationFeaturedCardProps {
  data: EnrichedMeditation;
  onPress: (data: EnrichedMeditation) => void | Promise<void>;
  cardColor: {
    bgColor: string;
    color: string;
  };
}

const MeditationFeaturedCard: React.FC<MeditationFeaturedCardProps> = ({
  data,
  onPress,
  cardColor,
}) => {
  const { title, duration, description, category, image } = data;

  const descText =
    description ||
    (category ? category : "Calming ambience · Best with headphones");

  return (
    <NimbusUltraFeaturedCard
      title={title}
      subtitle={`${duration || "3"} min · Reflection`}
      description={descText}
      image={image}
      badge={category || "For you"} // or "Relaxing" etc
      tint={cardColor.bgColor} // keep your palette, but as a glow
      accent={cardColor.color} // used for dot + accent bar
      onPress={() => onPress(data)}
    />
  );
};

export default MeditationFeaturedCard;
