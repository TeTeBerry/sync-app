import Taro from '@tarojs/taro';
import {
  generatePosterBackground,
  type GeneratePosterBackgroundInput,
} from '@/api/sync/posterBackground';

type PosterCanvas = HTMLCanvasElement & {
  createImage?: () => HTMLImageElement;
};

export async function fetchPosterAiBackgroundUrl(
  input: GeneratePosterBackgroundInput,
): Promise<string | null> {
  try {
    const result = await generatePosterBackground(input);
    const url = result?.imageUrl?.trim();
    if (!result?.available || !url) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function drawCanvasCoverImage(
  ctx: CanvasRenderingContext2D,
  canvas: PosterCanvas,
  imageUrl: string,
  width: number,
  height: number,
): Promise<void> {
  const localPath = await resolveCanvasImagePath(imageUrl);
  const image = await loadCanvasImage(canvas, localPath);
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function drawPosterReadabilityOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(8, 10, 24, 0.45)');
  gradient.addColorStop(0.55, 'rgba(8, 10, 24, 0.35)');
  gradient.addColorStop(1, 'rgba(8, 10, 24, 0.72)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

async function resolveCanvasImagePath(imageUrl: string): Promise<string> {
  if (!/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  const info = await Taro.getImageInfo({ src: imageUrl });
  return info.path || imageUrl;
}

function loadCanvasImage(canvas: PosterCanvas, src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.createImage === 'function') {
      const image = canvas.createImage();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('poster background image load failed'));
      image.src = src;
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('poster background image load failed'));
    image.src = src;
  });
}
