import type { ImageSourcePropType } from "react-native";

import type { ProtocolTemplateCardItem } from "@/components/common/ProtocolTemplateCard";
import {
  PROTOCOL_TEMPLATES,
  type ProtocolTemplate,
} from "@/features/tools/data/protocolTemplates";
import type { ProtocolTemplateApiItem } from "@/features/tools/types/protocolTemplateTypes";

export type ProtocolTemplateCardData = ProtocolTemplateCardItem & {
  id: number;
  description: string;
  context: string | null;
  category: string | null;
  benefits: string[];
  tags: string[];
  image: ImageSourcePropType | null;
  blueprints: ProtocolTemplateApiItem["blueprints"];
};

export const normalizeProtocolTemplateSearchValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getProtocolTemplateCategories = (
  templates: ProtocolTemplateApiItem[]
) =>
  Array.from(
    new Set(templates.map((template) => template.category).filter(Boolean))
  ) as string[];

export const toProtocolTemplateCardData = (
  template: ProtocolTemplateApiItem
): ProtocolTemplateCardData => ({
  id: template.id,
  title: template.title || template.name,
  description: template.description,
  context: template.context,
  category: template.category,
  benefits: template.benefits,
  tags:
    template.tags.length > 0
      ? template.tags
      : template.category
        ? [template.category]
        : [],
  blueprints: template.blueprints,
  image: template.image ? { uri: template.image } : null,
});

export const getProtocolTemplateIdParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

export const getProtocolTemplateById = (id?: string | null): ProtocolTemplate | null =>
  PROTOCOL_TEMPLATES.find((template) => template.id === id) ?? null;
