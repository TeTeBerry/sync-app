import { afterEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import {
  clearCloudTempUrlCacheForTests,
  isCloudStorageFileId,
  resolveCloudFileIdsToTempUrls,
} from '../../../src/utils/cloudImage';

vi.mock('../../../src/constants/cloud', () => ({
  isCloudStorageUploadEnabled: () => true,
}));

describe('cloudImage', () => {
  afterEach(() => {
    clearCloudTempUrlCacheForTests();
    vi.restoreAllMocks();
  });

  it('detects cloud fileID', () => {
    expect(
      isCloudStorageFileId('cloud://sync-prd-d7gquj4qk86da9bb2.xxx/ugc/posts/u1/a.jpg'),
    ).toBe(true);
    expect(isCloudStorageFileId('https://example.com/a.jpg')).toBe(false);
  });

  it('resolves fileIDs via getTempFileURL', async () => {
    const fileId = 'cloud://env.x/ugc/posts/u1/a.jpg';
    const prevCloud = Taro.cloud;
    Taro.cloud = {
      getTempFileURL: vi.fn().mockResolvedValue({
        fileList: [
          { fileID: fileId, tempFileURL: 'https://tmp.example/a.jpg', status: 0 },
        ],
      }),
    } as unknown as Taro.cloud.Cloud;

    try {
      const urls = await resolveCloudFileIdsToTempUrls([fileId]);
      expect(urls).toEqual(['https://tmp.example/a.jpg']);
    } finally {
      Taro.cloud = prevCloud;
    }
  });
});
