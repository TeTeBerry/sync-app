import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => {
      storage.set(key, value);
    },
    removeStorageSync: (key: string) => {
      storage.delete(key);
    },
  },
}));

import {
  clearLocalChatHistory,
  readLocalChatHistory,
  writeLocalChatHistory,
} from './aiChatLocalHistory';

describe('aiChatLocalHistory', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('persists and reads settled user/ai messages', () => {
    writeLocalChatHistory('sess-1', [
      { id: '1', from: 'user', text: '你好' },
      { id: '2', from: 'ai', text: '你好呀', streaming: true },
      { id: '3', from: 'ai', text: '最终回复' },
    ]);
    const loaded = readLocalChatHistory('sess-1');
    expect(loaded?.map((m) => m.id)).toEqual(['1', '3']);
  });

  it('clears session cache', () => {
    writeLocalChatHistory('sess-2', [{ id: '1', from: 'user', text: 'test' }]);
    clearLocalChatHistory('sess-2');
    expect(readLocalChatHistory('sess-2')).toBeNull();
  });
});
