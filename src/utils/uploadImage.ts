import Taro from '@tarojs/taro';
import { API_BASE_URL } from '../constants/api';
import type { ApiResponse } from '../types/backend';
import { handleApiUnauthorized } from '../api/handleApiUnauthorized';
import { ownerQueryParams } from '../api/requestActor';
import { getAccessToken, getAuthHeaders } from './authStorage';

/** 选择手环图，返回临时文件路径（已尽量压缩）。 */
export async function pickWristbandImagePath(): Promise<string | null> {
  const result = await Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  }).catch(() => null);

  const path = result?.tempFilePaths?.[0];
  if (!path) return null;

  const compressed = await Taro.compressImage({ src: path, quality: 80 }).catch(
    () => null,
  );
  return compressed?.tempFilePath ?? path;
}

export async function uploadImageFile(filePath: string): Promise<string> {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/uploads/images`;
  const formData = ownerQueryParams();

  const res = await Taro.uploadFile({
    url,
    filePath,
    name: 'file',
    formData,
    header: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  });

  let parsed: ApiResponse<{ url: string }> | null = null;
  try {
    parsed = JSON.parse(res.data) as ApiResponse<{ url: string }>;
  } catch {
    parsed = null;
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    const message = parsed?.message?.trim() || `上传失败 (${res.statusCode})`;
    if (res.statusCode === 401 && getAccessToken()) {
      handleApiUnauthorized(message);
    }
    throw new Error(message);
  }

  if (!parsed) {
    throw new Error('上传响应解析失败');
  }

  if (parsed.code !== 200 || !parsed.data?.url) {
    const message = parsed.message || '上传失败';
    if (parsed.code === 401 && getAccessToken()) {
      handleApiUnauthorized(message);
    }
    throw new Error(message);
  }

  return parsed.data.url;
}
