import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const requestSubscribeMessage = vi.fn();

vi.mock('@tarojs/taro', () => ({
  default: {
    ENV_TYPE: {
      WEAPP: 'WEAPP',
      WEB: 'WEB',
    },
    getEnv: vi.fn(() => 'WEAPP'),
    requestSubscribeMessage,
  },
}));

describe('wechatSubscribeMessage activity updates', () => {
  const originalTemplate = process.env.TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE = 'tmpl-activity';
    vi.resetModules();
  });

  afterEach(() => {
    process.env.TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE = originalTemplate;
    vi.resetModules();
  });

  it('returns accepted when user grants WeChat consent', async () => {
    requestSubscribeMessage.mockResolvedValue({ 'tmpl-activity': 'accept' });
    const { requestActivityUpdateSubscribe } =
      await import('@/utils/wechatSubscribeMessage');

    await expect(requestActivityUpdateSubscribe()).resolves.toBe('accepted');
  });

  it('returns rejected when user declines WeChat consent', async () => {
    requestSubscribeMessage.mockResolvedValue({ 'tmpl-activity': 'reject' });
    const { requestActivityUpdateSubscribe } =
      await import('@/utils/wechatSubscribeMessage');

    await expect(requestActivityUpdateSubscribe()).resolves.toBe('rejected');
  });

  it('returns unsupported outside WeChat mini program', async () => {
    const Taro = (await import('@tarojs/taro')).default;
    vi.mocked(Taro.getEnv).mockReturnValue('WEB' as never);
    const { requestActivityUpdateSubscribe } =
      await import('@/utils/wechatSubscribeMessage');

    await expect(requestActivityUpdateSubscribe()).resolves.toBe('unsupported');
  });
});
