import { useEffect, useMemo, useState } from 'react';
import {
  blankUnresolvedImageUrls,
  resolveDisplayImageUrls,
} from '../utils/resolveDisplayImageUrls';

/** Resolve cloud:// fileIDs to temp HTTPS URLs for Image components. */
export function useDisplayImageUrls(urls: string[]): string[] {
  const inputKey = useMemo(() => urls.join('\n'), [urls]);
  const [resolved, setResolved] = useState<string[]>(() =>
    blankUnresolvedImageUrls(urls),
  );

  useEffect(() => {
    const candidates = inputKey ? inputKey.split('\n').filter((url) => url.trim()) : [];
    if (!candidates.length) {
      setResolved([]);
      return;
    }

    setResolved(blankUnresolvedImageUrls(candidates));

    let cancelled = false;
    void resolveDisplayImageUrls(candidates)
      .then((next) => {
        if (!cancelled) setResolved(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResolved(blankUnresolvedImageUrls(candidates));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inputKey]);

  return resolved;
}
