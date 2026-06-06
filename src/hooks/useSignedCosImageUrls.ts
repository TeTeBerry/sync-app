import { useEffect, useMemo, useState } from 'react';
import {
  blankCosPostUrlsForDisplay,
  resolveSignedCosImageUrls,
} from '../utils/resolveSignedCosImageUrls';

export function useSignedCosImageUrls(urls: string[]): string[] {
  const inputKey = useMemo(() => urls.join('\n'), [urls]);
  const [resolved, setResolved] = useState<string[]>(() =>
    blankCosPostUrlsForDisplay(urls),
  );

  useEffect(() => {
    const candidates = inputKey ? inputKey.split('\n').filter((url) => url.trim()) : [];
    if (!candidates.length) {
      setResolved([]);
      return;
    }

    setResolved(blankCosPostUrlsForDisplay(candidates));

    let cancelled = false;
    void resolveSignedCosImageUrls(candidates)
      .then((next) => {
        if (!cancelled) setResolved(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResolved(blankCosPostUrlsForDisplay(candidates));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inputKey]);

  return resolved;
}
