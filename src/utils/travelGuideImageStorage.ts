import Taro from '@tarojs/taro';

const DIR_NAME = 'travel-guide';

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

export function travelGuideImageDestPath(sessionId: string, messageId: string): string {
  return `${Taro.env.USER_DATA_PATH}/${DIR_NAME}/${safeSegment(sessionId)}_${safeSegment(messageId)}.png`;
}

function ensureTravelGuideDir(): void {
  const fs = Taro.getFileSystemManager();
  const dir = `${Taro.env.USER_DATA_PATH}/${DIR_NAME}`;
  try {
    fs.mkdirSync(dir, true);
  } catch {
    // already exists
  }
}

export function travelGuideImageExists(filePath: string): boolean {
  if (!filePath?.trim()) return false;
  try {
    Taro.getFileSystemManager().accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Copy wx temp file into USER_DATA_PATH so it survives leaving the chat page. */
export function persistTravelGuideImage(
  tempPath: string,
  sessionId: string,
  messageId: string,
): Promise<string> {
  const dest = travelGuideImageDestPath(sessionId, messageId);
  if (!tempPath?.trim()) return Promise.resolve(dest);

  ensureTravelGuideDir();
  const fs = Taro.getFileSystemManager();

  return new Promise((resolve) => {
    fs.copyFile({
      srcPath: tempPath,
      destPath: dest,
      success: () => resolve(dest),
      fail: () => resolve(tempPath),
    });
  });
}

export function resolveTravelGuideImagePath(
  imagePath: string,
  sessionId: string,
  messageId: string,
): string {
  if (travelGuideImageExists(imagePath)) return imagePath;
  const saved = travelGuideImageDestPath(sessionId, messageId);
  if (travelGuideImageExists(saved)) return saved;
  return imagePath;
}
