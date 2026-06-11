import { vi } from 'vitest';

/** Taro runtime globals required by @tarojs/components / dom-external in unit tests. */
(globalThis as { ENABLE_INNER_HTML?: boolean }).ENABLE_INNER_HTML = true;

/** cos-wx-sdk-v5 expects a browser `window` at import time. */
vi.mock('cos-wx-sdk-v5', () => ({
  default: vi.fn(() => ({
    postObject: vi.fn(),
    putObject: vi.fn(),
  })),
}));
