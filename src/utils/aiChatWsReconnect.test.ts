import { describe, expect, it } from 'vitest';
import {
  appendPartialStreamRetryHint,
  isAuthSessionErrorMessage,
  isWsTurnRetryableError,
  wsReconnectDelayMs,
} from './aiChatWs/reconnect';

describe('aiChatWs/reconnect', () => {
  it('computes exponential backoff', () => {
    expect(wsReconnectDelayMs(0)).toBe(400);
    expect(wsReconnectDelayMs(1)).toBe(800);
  });

  it('allows retry only when no events were received', () => {
    expect(isWsTurnRetryableError(new Error('network'), false)).toBe(true);
    expect(isWsTurnRetryableError(new Error('network'), true)).toBe(false);
    expect(
      isWsTurnRetryableError(
        Object.assign(new Error('x'), { name: 'AbortError' }),
        false,
      ),
    ).toBe(false);
  });

  it('does not retry auth session errors', () => {
    expect(isWsTurnRetryableError(new Error('登录已过期，请重新登录'), false)).toBe(
      false,
    );
    expect(isAuthSessionErrorMessage('用户身份与登录态不一致')).toBe(true);
  });

  it('appends partial stream hint once', () => {
    expect(appendPartialStreamRetryHint('连接中断')).toContain('重新发送');
    expect(appendPartialStreamRetryHint('已断开（可重新发送）')).toBe(
      '已断开（可重新发送）',
    );
  });
});
