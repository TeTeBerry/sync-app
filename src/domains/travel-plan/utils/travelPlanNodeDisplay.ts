import type { TravelPlanNode } from '../types';

export function resolveTravelPlanExpandedDetail(
  node: Pick<TravelPlanNode, 'subtitle' | 'detail'>,
): string | undefined {
  const detail = node.detail?.trim();
  if (!detail) {
    return undefined;
  }

  const subtitle = node.subtitle?.trim();
  if (!subtitle || detail === subtitle) {
    return undefined;
  }

  if (detail.startsWith(subtitle)) {
    const extra = detail
      .slice(subtitle.length)
      .replace(/^\s*[·•]\s*/, '')
      .trim();
    return extra || undefined;
  }

  return detail;
}
