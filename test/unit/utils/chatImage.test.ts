import { describe, expect, it } from 'vitest';
import { isLocalImageFileRef } from '@/utils/chatImage';

describe('isLocalImageFileRef', () => {
  it('recognizes WeChat device and devtools temp paths', () => {
    expect(isLocalImageFileRef('wxfile://tmp_abc.jpg')).toBe(true);
    expect(
      isLocalImageFileRef(
        'http://tmp/wxfb0ad0f51a836ae1.o6zAJs7t7QmyBKCtv7q9mCnkl77Y.png',
      ),
    ).toBe(true);
    expect(isLocalImageFileRef('http://usr/saved.png')).toBe(true);
  });

  it('does not treat real remote URLs as local', () => {
    expect(isLocalImageFileRef('http://127.0.0.1:3000/uploads/a.jpg')).toBe(false);
    expect(isLocalImageFileRef('https://evil.example.com/uploads/x.jpg')).toBe(false);
  });
});
