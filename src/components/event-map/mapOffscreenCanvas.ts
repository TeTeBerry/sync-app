/** 创建离屏 Canvas（H5 document / 微信 createOffscreenCanvas）。 */

type OffscreenCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
};

type WxOffscreen = {
  createOffscreenCanvas?: (options: {
    type: string;
    width: number;
    height: number;
  }) => OffscreenCanvas;
};

function getWx(): WxOffscreen | undefined {
  return (globalThis as { wx?: WxOffscreen }).wx;
}

export function createMapOffscreenCanvas(
  width: number,
  height: number,
): OffscreenCanvas | null {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));

  const wx = getWx();
  if (typeof wx?.createOffscreenCanvas === 'function') {
    try {
      const canvas = wx.createOffscreenCanvas({
        type: '2d',
        width: w,
        height: h,
      });
      if (canvas && typeof canvas.getContext === 'function') {
        return canvas;
      }
    } catch {
      // fall through
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      if (typeof canvas.getContext !== 'function') {
        return null;
      }
      canvas.width = w;
      canvas.height = h;
      return canvas as OffscreenCanvas;
    } catch {
      return null;
    }
  }

  return null;
}

export function isMapOffscreenSupported(): boolean {
  if (typeof getWx()?.createOffscreenCanvas === 'function') {
    return true;
  }
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const probe = document.createElement('canvas');
    return typeof probe.getContext === 'function';
  } catch {
    return false;
  }
}
