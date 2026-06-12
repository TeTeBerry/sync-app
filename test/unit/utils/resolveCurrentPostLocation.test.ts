import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchReverseGeocodeLabel } from '@/api/sync/travelGuide';
import {
  clearCurrentPostLocationCache,
  resolveCurrentPostLocation,
} from '@/utils/resolveCurrentPostLocation';
import { ensureUserLocationAuthorized, getUserGcj02Location } from '@/utils/tencentMap';

vi.mock('@/constants/api', () => ({
  isLiveApi: vi.fn(() => true),
}));

vi.mock('@/api/sync/travelGuide', () => ({
  fetchReverseGeocodeLabel: vi.fn(),
}));

vi.mock('@/utils/tencentMap', () => ({
  ensureUserLocationAuthorized: vi.fn(),
  getUserGcj02Location: vi.fn(),
}));

describe('resolveCurrentPostLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCurrentPostLocationCache();
  });

  it('returns reverse-geocoded label from GPS', async () => {
    vi.mocked(ensureUserLocationAuthorized).mockResolvedValue(true);
    vi.mocked(getUserGcj02Location).mockResolvedValue({
      latitude: 22.5,
      longitude: 113.9,
    });
    vi.mocked(fetchReverseGeocodeLabel).mockResolvedValue({ label: '深圳南山区' });

    await expect(resolveCurrentPostLocation()).resolves.toBe('深圳南山区');
    expect(fetchReverseGeocodeLabel).toHaveBeenCalledWith(22.5, 113.9);
  });

  it('returns undefined when location permission denied', async () => {
    vi.mocked(ensureUserLocationAuthorized).mockResolvedValue(false);

    await expect(resolveCurrentPostLocation()).resolves.toBeUndefined();
    expect(fetchReverseGeocodeLabel).not.toHaveBeenCalled();
  });
});
