import Taro from '@tarojs/taro';
import { isCloudStorageUploadEnabled } from '../constants/cloud';
import { uploadImagesToCloud } from './cloudUpload';

/**
 * `wx.cloud.uploadFile` → `cloud://` fileID（Nest 仅存 fileID；展示时 getTempFileURL）。
 */
export async function uploadImageFile(filePath: string): Promise<string> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('图片路径为空');
  }

  if (!isCloudStorageUploadEnabled()) {
    throw new Error('请配置 TARO_APP_CLOUDBASE_ENV_ID 并启用小程序云开发');
  }

  const [fileId] = await uploadImagesToCloud([trimmed]);
  return fileId;
}
