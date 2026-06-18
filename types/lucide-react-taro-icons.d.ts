/**
 * lucide-react-taro publishes per-icon ESM under `icons/*` but omits matching
 * `dist/types/icons/*.d.ts` in the npm tarball. Ambient typings for the barrel.
 */
declare module 'lucide-react-taro/icons/*' {
  import type { CSSProperties, FC } from 'react';
  import type { ImageProps } from '@tarojs/components';

  type LucideIconProps = Omit<ImageProps, 'src' | 'style'> & {
    size?: number | string;
    color?: string;
    filled?: boolean;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    style?: CSSProperties;
  };

  type LucideIcon = FC<LucideIconProps>;

  export const AudioWaveform: LucideIcon;
  export const BedDouble: LucideIcon;
  export const Bell: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Bot: LucideIcon;
  export const Calendar: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const Car: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const CircleCheck: LucideIcon;
  export const Clock: LucideIcon;
  export const FileText: LucideIcon;
  export const Flame: LucideIcon;
  export const House: LucideIcon;
  export const Image: LucideIcon;
  export const Info: LucideIcon;
  export const List: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Map: LucideIcon;
  export const MapPin: LucideIcon;
  export const Megaphone: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Minus: LucideIcon;
  export const Music2: LucideIcon;
  export const Plane: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const ScanLine: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Share2: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Star: LucideIcon;
  export const Ticket: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const TriangleAlert: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const Utensils: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
}
