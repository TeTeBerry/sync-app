import {
  isCloudStorageUploadEnabled,
  isWeappCloudRunTransportEnabled,
} from '@/constants/cloud';
import { resolveCloudFileIdsToTempUrls } from '@/utils/cloudImage';
import { readLocalImageAsJpegDataUrl } from '@/utils/chatImage';
import { uploadImageFile } from '@/utils/uploadImage';

/**
 * Build image ref for receipt OCR API.
 * Production weapp: upload to CloudBase → temp HTTPS URL (callContainer body must stay <100KB).
 * Local dev: JPEG data URL.
 */
export async function buildTravelPlanReceiptImageRef(
  filePath: string,
): Promise<string> {
  if (isWeappCloudRunTransportEnabled() || isCloudStorageUploadEnabled()) {
    const fileId = await uploadImageFile(filePath);
    const [tempUrl] = await resolveCloudFileIdsToTempUrls([fileId]);
    if (!tempUrl?.trim()) {
      throw new Error('图片上传成功但无法读取，请重试');
    }
    return tempUrl.trim();
  }

  return readLocalImageAsJpegDataUrl(filePath);
}
