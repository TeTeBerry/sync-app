import {
  isCloudStorageUploadEnabled,
  isWeappCloudRunTransportEnabled,
} from '@/constants/cloud';
import { initCloudBase } from '@/utils/cloudInit';
import { readLocalImageAsJpegDataUrl } from '@/utils/chatImage';
import { uploadImageFile } from '@/utils/uploadImage';
import { isCloudStorageFileId } from '@/utils/cloudImage';

/**
 * Build image ref for receipt OCR API.
 * Production weapp: `cloud://` fileID only (callContainer body must stay <100KB).
 * Local dev without cloud: JPEG data URL.
 */
export async function buildTravelPlanReceiptImageRef(
  filePath: string,
): Promise<string> {
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

/** Block oversized / legacy payloads before callContainer. */
export function assertReceiptImageRefForTransport(imageRef: string): void {
  if (!isWeappCloudRunTransportEnabled()) {
    return;
  }

  const trimmed = imageRef.trim();
  if (trimmed.startsWith('data:')) {
    throw new Error('截图须先上传云存储，请更新小程序后重试');
  }
  if (isCloudStorageFileId(trimmed)) {
    return;
  }
  if (trimmed.length > 4_000) {
    throw new Error('截图数据过大，请换一张更小的图片');
  }
}
