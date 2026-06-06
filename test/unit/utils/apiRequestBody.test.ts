import { describe, expect, it } from 'vitest';
import { taroRequestData } from '@/utils/apiRequestBody';

describe('taroRequestData', () => {
  it('parses JSON string body for application/json POST', () => {
    const data = taroRequestData({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'hello' }),
    });
    expect(data).toEqual({ body: 'hello' });
  });

  it('leaves GET body undefined', () => {
    const data = taroRequestData({
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'hello' }),
    });
    expect(data).toEqual(JSON.stringify({ body: 'hello' }));
  });
});
