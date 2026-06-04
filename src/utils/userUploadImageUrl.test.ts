import { describe, expect, it } from 'vitest';
import { isTrustedUploadImageUrl } from './userUploadImageUrl';

describe('isTrustedUploadImageUrl', () => {
  it('accepts localhost uploads path', () => {
    expect(isTrustedUploadImageUrl('http://127.0.0.1:3000/uploads/a.jpg')).toBe(true);
  });

  it('rejects data URLs and external hosts', () => {
    expect(isTrustedUploadImageUrl('data:image/png;base64,abc')).toBe(false);
    expect(isTrustedUploadImageUrl('https://evil.example.com/uploads/x.jpg')).toBe(
      false,
    );
  });
});
