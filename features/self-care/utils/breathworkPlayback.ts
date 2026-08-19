type RouteValue = string | string[] | undefined;

export type BreathWorkRouteParams = {
  breathworkId?: RouteValue;
  breathworkSlug?: RouteValue;
};

export type ParsedBreathWorkRouteParams = {
  breathworkId: string;
  breathworkSlug?: string;
};

const parseBreathWorkRouteValue = (value?: RouteValue): string | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = rawValue?.trim();

  return trimmedValue || undefined;
};

export const parseBreathWorkRouteParams = (
  params: BreathWorkRouteParams
): ParsedBreathWorkRouteParams => ({
  breathworkId: parseBreathWorkRouteValue(params.breathworkId) ?? "",
  breathworkSlug: parseBreathWorkRouteValue(params.breathworkSlug),
});
