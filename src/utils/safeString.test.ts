import { describe, expect, it } from 'vitest';
import { safeTrim, safeTrimOrUndefined } from './safeString';

describe('safeTrim', () => {
  it('never throws on non-string values', () => {
    expect(safeTrim(undefined)).toBe('');
    expect(safeTrim(null)).toBe('');
    expect(safeTrim(42)).toBe('42');
    expect(safeTrim({})).toBe('');
  });

  it('trims strings', () => {
    expect(safeTrim('  hi  ')).toBe('hi');
    expect(safeTrimOrUndefined('  ')).toBeUndefined();
  });
});
