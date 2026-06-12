import Taro from '@tarojs/taro';
import {
  CLOUD_UGC_UPLOAD_PREFIX,
  isCloudStorageUploadEnabled,
} from '../constants/cloud';
import { getResolvedAuthUserId } from './authStorage';
import { isLocalImageFileRef } from './chatImage';

function inferImageExtension(filePath: string): string {
  const name = filePath.split(/[/?#]/).pop() ?? '';
  const match = name.match(/\.(jpe?g|png|gif|webp|bmp)$/i);
  if (!match?.[1]) return 'jpg';
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}

function buildCloudUgcPath(userId: string, ext: string): string {
  const safeUserId = userId.trim();
  if (!safeUserId) {
    throw new Error('用户未登录，无法上传图片');
  }
  const suffix = ext.startsWith('.') ? ext : `.${ext}`;
  return `${CLOUD_UGC_UPLOAD_PREFIX}/${safeUserId}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}${suffix}`;
}

function uploadErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null) {
    const errMsg = (err as { errMsg?: string }).errMsg;
    if (typeof errMsg === 'string' && errMsg.trim()) {
      return errMsg.trim();
    }
  }
  return '云存储上传失败';
}

/**
 * Upload a local temp image to CloudBase storage via `wx.cloud.uploadFile`.
 * Returns `cloud://` fileID for Nest to persist.
 */
export async function uploadImageToCloud(filePath: string): Promise<string> {
  if (!isCloudStorageUploadEnabled()) {
    throw new Error('云存储未启用');
  }
  if (!Taro.cloud) {
    throw new Error('当前环境不支持云开发');
  }

  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('图片路径为空');
  }
  if (!isLocalImageFileRef(trimmed)) {
    throw new Error('仅支持上传本地临时图片路径');
  }

  const userId = getResolvedAuthUserId();
  if (!userId) {
    throw new Error('用户未登录，无法上传图片');
  }

  const cloudPath = buildCloudUgcPath(userId, inferImageExtension(trimmed));

  try {
    const res = await Taro.cloud.uploadFile({
      cloudPath,
      filePath: trimmed,
    });
    const fileId = res.fileID?.trim();
    if (!fileId) {
      throw new Error('云存储未返回 fileID');
    }
    return fileId;
  } catch (error) {
    throw new Error(uploadErrorMessage(error));
  }
}

/** Batch upload local paths; returns fileIDs in order. */
export async function uploadImagesToCloud(imagePaths: string[]): Promise<string[]> {
  if (!imagePaths.length) return [];
  return Promise.all(imagePaths.map((path) => uploadImageToCloud(path)));
}
