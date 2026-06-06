import COS from 'cos-wx-sdk-v5';
import { fetchCosStsKey, type CosStsKey } from '../api/sync/cos';
import {
  COS_BUCKET,
  COS_POSTS_UPLOAD_PREFIX,
  COS_PUBLIC_BASE_URL,
  COS_REGION,
} from '../constants/cos';
import { getResolvedAuthUserId } from './authStorage';
import { isLocalImageFileRef } from './chatImage';

const STS_REFRESH_BUFFER_SEC = 60;

let cachedSts: CosStsKey | null = null;
let cosClient: COS | null = null;

function isStsFresh(sts: CosStsKey, nowSec: number): boolean {
  return sts.ExpiredTime > nowSec + STS_REFRESH_BUFFER_SEC;
}

async function resolveStsKey(forceRefresh = false): Promise<CosStsKey> {
  const nowSec = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedSts && isStsFresh(cachedSts, nowSec)) {
    return cachedSts;
  }

  cachedSts = await fetchCosStsKey();
  return cachedSts;
}

function getCosClient(): COS {
  if (cosClient) return cosClient;

  cosClient = new COS({
    SimpleUploadMethod: 'putObject',
    getAuthorization: (_options, callback) => {
      void resolveStsKey()
        .then((sts) => {
          callback({
            TmpSecretId: sts.TmpSecretId,
            TmpSecretKey: sts.TmpSecretKey,
            SecurityToken: sts.SessionToken,
            StartTime: Math.floor(Date.now() / 1000),
            ExpiredTime: sts.ExpiredTime,
          });
        })
        .catch((error: unknown) => {
          callback({
            TmpSecretId: '',
            TmpSecretKey: '',
            SecurityToken: '',
            ExpiredTime: 0,
            Error: error,
          });
        });
    },
  });

  return cosClient;
}

/** Build public HTTPS URL for an object key in the configured bucket. */
export function buildCosObjectUrl(key: string): string {
  const normalizedKey = key.replace(/^\/+/, '');
  return `${COS_PUBLIC_BASE_URL}/${normalizedKey}`;
}

function inferImageExtension(filePath: string): string {
  const name = filePath.split(/[/?#]/).pop() ?? '';
  const match = name.match(/\.(jpe?g|png|gif|webp|bmp)$/i);
  if (!match?.[1]) return '.jpg';
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? '.jpg' : `.${ext}`;
}

function buildCosPostImageKey(userId: string, ext: string): string {
  const safeUserId = userId.trim();
  if (!safeUserId) {
    throw new Error('用户未登录，无法上传图片');
  }

  return `${COS_POSTS_UPLOAD_PREFIX}/${safeUserId}/${Date.now()}_${Math.random().toString(36)}${ext}`;
}

function uploadErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null) {
    const message = (err as { message?: unknown; error?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
    const nested = (err as { error?: unknown }).error;
    if (nested instanceof Error && nested.message.trim()) {
      return nested.message;
    }
  }
  return 'COS 上传失败';
}

function uploadOneImage(cos: COS, filePath: string, key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        FilePath: filePath,
      },
      (err, data) => {
        if (err) {
          reject(new Error(uploadErrorMessage(err)));
          return;
        }

        // Always use configured public base — SDK Location host may differ.
        resolve(buildCosObjectUrl(key));
      },
    );
  });
}

/**
 * Upload WeChat local image paths to COS via STS credentials.
 * Returns public HTTPS URLs for each uploaded object.
 */
export async function uploadImagesToCos(imagePaths: string[]): Promise<string[]> {
  if (!imagePaths.length) return [];

  const userId = getResolvedAuthUserId();
  if (!userId) {
    throw new Error('用户未登录，无法上传图片');
  }
  const cos = getCosClient();

  const uploads = imagePaths.map(async (rawPath) => {
    const filePath = rawPath.trim();
    if (!filePath) {
      throw new Error('图片路径为空');
    }
    if (!isLocalImageFileRef(filePath)) {
      throw new Error('仅支持上传本地临时图片路径');
    }

    const key = buildCosPostImageKey(userId, inferImageExtension(filePath));

    try {
      return await uploadOneImage(cos, filePath, key);
    } catch (error) {
      cachedSts = null;
      throw error instanceof Error ? error : new Error(uploadErrorMessage(error));
    }
  });

  return Promise.all(uploads);
}

/** Test helper — clears cached STS and COS singleton. */
export function resetCosUploadClientForTests(): void {
  cachedSts = null;
  cosClient = null;
}
