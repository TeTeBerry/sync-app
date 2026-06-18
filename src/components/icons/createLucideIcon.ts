import type { ComponentType, CSSProperties } from 'react';
import { createElement } from 'react';

/** WeChat mini program renders lucide SVG as data-URL images — no CSS currentColor. */
export const DEFAULT_LUCIDE_ICON_COLOR = '#ffffff';

export type LucideIconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
  absoluteStrokeWidth?: boolean;
  'aria-hidden'?: boolean;
};

export function withDefaultIconColor<P extends LucideIconProps>(
  Icon: ComponentType<P>,
): ComponentType<P> {
  const Wrapped = (props: P) => {
    const color =
      props.color === undefined || props.color === 'inherit'
        ? DEFAULT_LUCIDE_ICON_COLOR
        : props.color;
    return createElement(Icon, { ...props, color });
  };
  Wrapped.displayName = Icon.displayName ?? 'LucideIcon';
  return Wrapped;
}
