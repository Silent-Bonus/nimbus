import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

const inFlightDownloads = new Map<string, Promise<string | null>>();

function isRemoteUri(uri: string) {
  return /^https?:\/\//i.test(uri);
}

function getStableAvatarKey(uri: string) {
  // Signed query parameters expire and change. The object path is stable.
  const withoutQuery = uri.split("?")[0];
  let hash = 0;

  for (let index = 0; index < withoutQuery.length; index += 1) {
    hash = (hash << 5) - hash + withoutQuery.charCodeAt(index);
    hash |= 0;
  }

  const extension = withoutQuery.toLowerCase().endsWith(".svg")
    ? "svg"
    : "img";

  return `nimbus-avatar-${Math.abs(hash)}.${extension}`;
}

async function downloadAvatar(uri: string): Promise<string | null> {
  if (!FileSystem.cacheDirectory || !isRemoteUri(uri)) {
    return uri;
  }

  const destination = `${FileSystem.cacheDirectory}${getStableAvatarKey(uri)}`;

  try {
    const cached = await FileSystem.getInfoAsync(destination);
    if (cached.exists && cached.size && cached.size > 0) {
      return destination;
    }

    const result = await FileSystem.downloadAsync(uri, destination);
    return result.status >= 200 && result.status < 300
      ? result.uri
      : uri;
  } catch {
    // Keep the remote URL as a fallback if local caching is unavailable.
    return uri;
  }
}

export function useCachedAvatarUri(uri?: string | null) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) {
      setCachedUri(null);
      return;
    }

    let active = true;
    const cacheKey = uri.split("?")[0];
    const existingDownload = inFlightDownloads.get(cacheKey);
    const download =
      existingDownload ??
      downloadAvatar(uri).finally(() => {
        inFlightDownloads.delete(cacheKey);
      });

    if (!existingDownload) {
      inFlightDownloads.set(cacheKey, download);
    }

    void download.then((resolvedUri) => {
      if (active) setCachedUri(resolvedUri);
    });

    return () => {
      active = false;
    };
  }, [uri]);

  return cachedUri;
}
