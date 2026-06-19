import { useEffect, useState } from 'react';
import { resolvePersonalityMediaUrl } from '../domains/personality-test/utils/resolvePersonalityMedia';
import { sanitizeRemoteImageUrl } from '../utils/imageUrl';

export function useResolvedAvatarSrc(avatar?: string): string {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const trimmed = avatar?.trim();
    if (!trimmed) {
      setUrl('');
      return;
    }

    if (trimmed.startsWith('avatar/')) {
      let cancelled = false;
      void resolvePersonalityMediaUrl(trimmed).then((resolved) => {
        if (!cancelled) setUrl(resolved);
      });
      return () => {
        cancelled = true;
      };
    }

    setUrl(sanitizeRemoteImageUrl(trimmed) ?? trimmed);
  }, [avatar]);

  return url;
}
