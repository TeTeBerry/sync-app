import Taro from '@tarojs/taro';
import { isCloudStorageUploadEnabled } from '../constants/cloud';
import {
  ChatImageTooLargeError,
  pickAndCompressChatImages,
  uploadChatImageRefs,
} from './chatImage';

export const MAX_CHAT_ATTACHMENTS = 3;

export function formatChatImagePickError(error: unknown): string {
  if (error instanceof ChatImageTooLargeError) {
    return '图片太大，请换一张或裁剪后重试';
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '图片处理失败，请重试';
}

export async function pickChatComposerImages(
  currentCount: number,
  maxCount = MAX_CHAT_ATTACHMENTS,
): Promise<string[]> {
  if (!isCloudStorageUploadEnabled()) {
    void Taro.showToast({
      title: '请配置云开发后再发图',
      icon: 'none',
    });
    return [];
  }

  const remaining = maxCount - currentCount;
  if (remaining <= 0) {
    void Taro.showToast({
      title: `最多添加 ${maxCount} 张图片`,
      icon: 'none',
    });
    return [];
  }

  try {
    return await pickAndCompressChatImages(remaining);
  } catch (error) {
    void Taro.showToast({
      title: formatChatImagePickError(error),
      icon: 'none',
    });
    return [];
  }
}

export async function uploadChatComposerImages(
  localPaths: string[],
): Promise<string[]> {
  if (!localPaths.length) return [];
  void Taro.showLoading({ title: '上传图片中…', mask: true });
  try {
    return await uploadChatImageRefs(localPaths);
  } finally {
    void Taro.hideLoading();
  }
}
