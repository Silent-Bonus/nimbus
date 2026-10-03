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
  level: string | null;
  benefits: string[];
  tags: string[];
  image: ImageSourcePropType | null;
  blueprints: NonNullable<ProtocolTemplateApiItem["blueprints"]>;
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
  title: template.title || template.name || "Untitled Template",
  description: template.description || "",
  context: template.context ?? null,
  category: template.category ?? null,
  level: template.level,
  benefits: template.benefits ?? [],
  tags: (template.tags ?? [])
    .map((tag) => (typeof tag === "string" ? tag : tag?.name ?? ""))
    .map((tag) => tag.trim())
    .filter(Boolean),
  blueprints: template.blueprints ?? [],
  image: template.image ? { uri: template.image } : null,
});

export const getProtocolTemplateIdParam = (value: unknown): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
};

export const getProtocolTemplateById = (id?: string | null): ProtocolTemplate | null =>
  PROTOCOL_TEMPLATES.find((template) => template.id === id) ?? null;
