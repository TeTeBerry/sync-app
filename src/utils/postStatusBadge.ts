import type { BackendPostStatusLabel } from './postStatus';

/** Status pill accent colors (align recruiting with --primary). */
export const POST_STATUS_BADGE_COLORS = {
  recruiting: '#FF0066',
  completed: '#34C759',
  hidden: '#8E8E93',
} as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

/** Tinted pill background + border from accent color (dot + text). */
export function postStatusBadgeTintStyle(color: string): {
  color: string;
  backgroundColor: string;
  borderColor: string;
} {
  const { r, g, b } = hexToRgb(color);
  return {
    color,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
  };
}

export type PostStatusBadgeVariant = 'full' | 'recruiting' | 'hidden';

export type PostStatusBadgeResult = {
  label: string;
  color: string;
  variant: PostStatusBadgeVariant;
};

export type PostStatusBadgeInput = {
  status: BackendPostStatusLabel;
};

/** Maps post `status` to a single status pill (label + color + variant). */
export function resolvePostStatusBadge(
  post: PostStatusBadgeInput,
): PostStatusBadgeResult {
  const status = post?.status;
  if (status === '已隐藏') {
    return {
      label: '已隐藏',
      color: POST_STATUS_BADGE_COLORS.hidden,
      variant: 'hidden',
    };
  }

  if (status === '已组队') {
    return {
      label: '已组队',
      color: POST_STATUS_BADGE_COLORS.completed,
      variant: 'full',
    };
  }

  return {
    label: '招募中',
    color: POST_STATUS_BADGE_COLORS.recruiting,
    variant: 'recruiting',
  };
}

/** Recruiting / hidden badges are author-only on home; event detail shows recruiting publicly. */
export function shouldShowPostStatusBadge(
  badge: PostStatusBadgeResult,
  isOwn: boolean,
  options?: { variant?: 'home' | 'event' },
): boolean {
  if (badge.variant === 'hidden') {
    return isOwn;
  }
  if (badge.variant === 'recruiting') {
    return isOwn || options?.variant === 'event';
  }
  return true;
}
