import {
  isCloudStorageUploadEnabled,
  isWeappCloudRunTransportEnabled,
} from '@/constants/cloud';
import { initCloudBase } from '@/utils/cloudInit';
import { readLocalImageAsJpegDataUrl } from '@/utils/chatImage';
import { uploadImageFile } from '@/utils/uploadImage';
import { isCloudStorageFileId } from '@/utils/cloudImage';

const IS_WEAPP_BUILD = process.env.TARO_ENV === 'weapp';

/**
 * Build image ref for receipt OCR API.
 * Weapp production: `cloud://` fileID only (callContainer body must stay <100KB).
 * H5 / local dev without cloud: JPEG data URL.
 */
export async function buildTravelPlanReceiptImageRef(
  filePath: string,
): Promise<string> {
  if (IS_WEAPP_BUILD) {
    if (!isCloudStorageUploadEnabled()) {
      throw new Error('云存储未配置，无法识别截图');
    }
    initCloudBase();
    const fileId = await uploadImageFile(filePath);
    if (!isCloudStorageFileId(fileId)) {
      throw new Error('截图上传失败，请重试');
    }
    return fileId;
  }

  if (isWeappCloudRunTransportEnabled() || isCloudStorageUploadEnabled()) {
    initCloudBase();
    const fileId = await uploadImageFile(filePath);
    if (!isCloudStorageFileId(fileId)) {
      throw new Error('截图上传失败，请重试');
    }
    return fileId;
  }

  return readLocalImageAsJpegDataUrl(filePath);
}

/** Block legacy data URLs before callContainer. */
export function assertReceiptImageRefForTransport(imageRef: string): void {
  if (!isWeappCloudRunTransportEnabled()) {
    return;
  }

  const trimmed = imageRef.trim();
  if (trimmed.startsWith('data:')) {
    throw new Error('截图须先上传云存储，请更新小程序后重试');
  }
  if (!isCloudStorageFileId(trimmed)) {
    throw new Error('截图上传失败，请重试');
  }
}
