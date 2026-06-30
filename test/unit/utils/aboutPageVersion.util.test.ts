import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/taro', () => ({
  default: {
    getAccountInfoSync: vi.fn(),
  },
}));

import Taro from '@tarojs/taro';
import {
  resolveAboutPageSyncMetaLabel,
  resolveAboutPageVersionLabel,
} from '@/utils/aboutPageVersion.util';

const t = vi.fn((key: string, params?: Record<string, string>) => {
  if (key === 'plur.about.version' && params?.version) {
    return `版本 ${params.version}`;
  }
  if (key === 'plur.about.versionDevelop') {
    return '版本 开发版';
  }
  if (key === 'plur.about.versionTrial') {
    return '版本 体验版';
  }
  return key;
});

describe('resolveAboutPageVersionLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses miniProgram.version when present', () => {
    vi.mocked(Taro.getAccountInfoSync).mockReturnValue({
      miniProgram: { version: '1.2.3', envVersion: 'release' },
    } as ReturnType<typeof Taro.getAccountInfoSync>);
    expect(resolveAboutPageVersionLabel(t)).toBe('版本 1.2.3');
  });

  it('falls back to develop label when version is empty', () => {
    vi.mocked(Taro.getAccountInfoSync).mockReturnValue({
      miniProgram: { version: '', envVersion: 'develop' },
    } as ReturnType<typeof Taro.getAccountInfoSync>);
    expect(resolveAboutPageVersionLabel(t)).toBe('版本 开发版');
  });

  it('falls back to trial label when version is empty on trial', () => {
    vi.mocked(Taro.getAccountInfoSync).mockReturnValue({
      miniProgram: { version: '', envVersion: 'trial' },
    } as ReturnType<typeof Taro.getAccountInfoSync>);
    expect(resolveAboutPageVersionLabel(t)).toBe('版本 体验版');
  });
});

describe('resolveAboutPageSyncMetaLabel', () => {
  it('formats legal sync meta for about page', () => {
    const metaT = vi.fn((key: string, params?: Record<string, string>) => {
      if (key === 'legal.updatedLabel') return '2026年6月26日';
      if (key === 'legal.meta' && params) {
        return `${params.app} · 更新日期：${params.date} · 版本 ${params.version}`;
      }
      return key;
    });
    expect(resolveAboutPageSyncMetaLabel(metaT)).toBe(
      'SYNC · 更新日期：2026年6月26日 · 版本 2026-06-26.1',
    );
  });
});
