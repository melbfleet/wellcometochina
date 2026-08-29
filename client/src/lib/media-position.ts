import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

type MediaPosition = {
  url: string;
  storageKey?: string | null;
  objectPosition?: string | null;
};

function addUrlKeys(keys: Set<string>, value?: string | null) {
  if (!value) return;
  keys.add(value);
  try {
    const parsed = new URL(value, window.location.origin);
    keys.add(parsed.pathname);
  } catch {
    // Relative upload URLs are expected.
  }
  const filename = value.split("/").pop();
  if (filename) keys.add(filename);
}

function keysForUrl(url?: string | null) {
  const keys = new Set<string>();
  addUrlKeys(keys, url);
  return Array.from(keys);
}

export function useMediaObjectPosition() {
  const { data = [] } = trpc.media.getObjectPositions.useQuery(undefined, {
    staleTime: 60_000,
  });

  const positionByKey = useMemo(() => {
    const map = new Map<string, string>();
    (data as MediaPosition[]).forEach(asset => {
      if (!asset.objectPosition) return;
      const keys = new Set<string>();
      addUrlKeys(keys, asset.url);
      addUrlKeys(keys, asset.storageKey);
      keys.forEach(key => map.set(key, asset.objectPosition!));
    });
    return map;
  }, [data]);

  return (url?: string | null, fallback = "50% 50%") => {
    if (!url) return fallback;
    for (const key of keysForUrl(url)) {
      const position = positionByKey.get(key);
      if (position) return position;
    }
    return fallback;
  };
}
