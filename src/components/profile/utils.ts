import { safeTrim } from '../../utils/safeString';

export function deriveInterestTag(bio?: string | null): string | null {
  const trimmed = safeTrim(bio);
  if (!trimmed) return null;
  if (trimmed.includes('电音')) return '电音';
  return null;
}
