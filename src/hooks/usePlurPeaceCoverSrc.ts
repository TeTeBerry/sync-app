import { useEffect, useState } from 'react';
import { PLUR_PEACE_ENTRY_COVER_KEY } from '@/constants/plurAssets';
import {
  getCachedPersonalityMediaUrl,
  resolvePersonalityMediaUrl,
} from '@/domains/personality-test/utils/resolvePersonalityMedia';

export function usePlurPeaceCoverSrc(): string {
  const [url, setUrl] = useState(() =>
    getCachedPersonalityMediaUrl(PLUR_PEACE_ENTRY_COVER_KEY),
  );

  useEffect(() => {
    let cancelled = false;
    void resolvePersonalityMediaUrl(PLUR_PEACE_ENTRY_COVER_KEY).then((resolved) => {
      if (!cancelled && resolved) {
        setUrl(resolved);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return url;
}
