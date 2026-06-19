import { describe, expect, it } from 'vitest';
import {
  containsUgcContactInfo,
  getUgcContactValidationError,
  UGC_CONTACT_FORBIDDEN_MESSAGE,
} from '@/utils/ugcContactValidation';

describe('ugcContactValidation', () => {
  it('detects phone numbers in comments', () => {
    expect(containsUgcContactInfo('我的号码 13800138000')).toBe(true);
  });

  it('detects wechat diversion phrases', () => {
    expect(containsUgcContactInfo('加我微信私聊')).toBe(true);
  });

  it('allows normal comment text', () => {
    expect(containsUgcContactInfo('同场可以一起逛吗')).toBe(false);
    expect(getUgcContactValidationError('同场可以一起逛吗')).toBeNull();
  });

  it('returns user-facing error message', () => {
    expect(getUgcContactValidationError('vx12345')).toBe(UGC_CONTACT_FORBIDDEN_MESSAGE);
  });
});
