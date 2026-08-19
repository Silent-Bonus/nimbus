import AsyncStorage from "@react-native-async-storage/async-storage";

export type SelfCareFavoriteContentType =
  | "meditation"
  | "soundscape"
  | "breathwork";

type FavoriteState = {
  ids: string[];
  hasStoredFavorites: boolean;
};

const FAVORITES_STORAGE_KEYS: Record<SelfCareFavoriteContentType, string> = {
  meditation: "meditation_favorites_v1",
  soundscape: "soundscape_favorites_v1",
  breathwork: "breathwork_favorites_v1",
};

const normalizeFavoriteIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.map((item) => String(item).trim()).filter(Boolean))
  );
};

const getFavoritesStorageKey = (type: SelfCareFavoriteContentType) =>
  FAVORITES_STORAGE_KEYS[type];

export const readFavoriteState = async (
  type: SelfCareFavoriteContentType
): Promise<FavoriteState> => {
  const raw = await AsyncStorage.getItem(getFavoritesStorageKey(type));

  if (!raw) {
    return {
      ids: [],
      hasStoredFavorites: false,
    };
  }

  const parsed: unknown = JSON.parse(raw);

  return {
    ids: normalizeFavoriteIds(parsed),
    hasStoredFavorites: true,
  };
};

export const readFavoriteIds = async (type: SelfCareFavoriteContentType) => {
  const { ids } = await readFavoriteState(type);
  return ids;
};

export const writeFavoriteIds = async (
  type: SelfCareFavoriteContentType,
  ids: string[]
) => {
  const normalized = normalizeFavoriteIds(ids);
  await AsyncStorage.setItem(
    getFavoritesStorageKey(type),
    JSON.stringify(normalized)
  );
  return normalized;
};

export const addFavoriteId = async (
  type: SelfCareFavoriteContentType,
  id: string
) => {
  const current = await readFavoriteIds(type);
  return writeFavoriteIds(type, [id, ...current]);
};

export const removeFavoriteId = async (
  type: SelfCareFavoriteContentType,
  id: string
) => {
  const current = await readFavoriteIds(type);
  return writeFavoriteIds(
    type,
    current.filter((favoriteId) => favoriteId !== id)
  );
};

export const toggleFavoriteId = async (
  type: SelfCareFavoriteContentType,
  id: string
) => {
  const normalizedId = id.trim();
  if (!normalizedId) {
    return readFavoriteIds(type);
  }

  const current = await readFavoriteIds(type);

  return current.includes(normalizedId)
    ? writeFavoriteIds(
        type,
        current.filter((favoriteId) => favoriteId !== normalizedId)
      )
    : writeFavoriteIds(type, [normalizedId, ...current]);
};
