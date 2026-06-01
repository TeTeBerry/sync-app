import './PageNavigation.scss';
import React, { type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-taro';
import { Button, Text, View } from '@tarojs/components';
import { useNavBarInsets, type NavBarInsets } from '../hooks/useNavBarInsets';
import { goBack, type RoutePath } from '../utils/route';
import { tabPageHeaderStyle } from './TabPageHeader';

const PAGE_GUTTER_PX = 16;
const BACK_BTN_PX = 36;
/** Gap between back button and title (px). */
export const TITLE_AFTER_BACK_PX = 10;

/** Bottom padding in header (matches event-detail). */
export const SUB_PAGE_HEADER_BOTTOM_PAD_PX = 10;
/** Toolbar row height — matches back button. */
export const SUB_PAGE_HEADER_ROW_PX = BACK_BTN_PX;
/** Extra height when a meta subtitle line is shown. */
export const SUB_PAGE_HEADER_META_EXTRA_PX = 22;

export function stackPageNavChromePx(
  insets: NavBarInsets,
  options?: { meta?: boolean },
): number {
  return (
    insets.paddingTop +
    SUB_PAGE_HEADER_BOTTOM_PAD_PX +
    SUB_PAGE_HEADER_ROW_PX +
    (options?.meta ? SUB_PAGE_HEADER_META_EXTRA_PX : 0)
  );
}

export interface PageNavigationProps {
  /** Title to the right of back + TITLE_AFTER_BACK_PX; omit when using `center`. */
  title?: string;
  /** Secondary line under title (event-detail meta). */
  meta?: string;
  /** Custom center column (e.g. AI assistant identity row). */
  center?: ReactNode;
  /** Left-align center content when `center` is set. */
  centerAlign?: 'center' | 'start';
  onBack?: () => void;
  /** Fallback when the page stack is empty. */
  fallback?: RoutePath;
  /** Right column (36–40px control). */
  trailing?: ReactNode;
  /** Page background behind the bar. */
  tone?: 'default' | 'surface';
  className?: string;
  style?: CSSProperties;
  backAriaLabel?: string;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  title,
  meta,
  center,
  centerAlign = 'center',
  onBack,
  fallback,
  trailing,
  tone = 'default',
  className,
  style,
  backAriaLabel = '返回',
}) => {
  const navInsets = useNavBarInsets();
  const insetStyle = tabPageHeaderStyle(navInsets);
  const headerStyle: CSSProperties = {
    ...insetStyle,
    paddingLeft: `${PAGE_GUTTER_PX}px`,
    paddingBottom: `${SUB_PAGE_HEADER_BOTTOM_PAD_PX}px`,
    ...style,
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    goBack(fallback);
  };

  const usePageCenterTitle = !center && Boolean(title || meta);

  const rootClass = [
    's-page-nav',
    tone === 'surface' ? 's-page-nav--surface' : '',
    usePageCenterTitle ? 's-page-nav--title-page' : '',
    center ? `s-page-nav--center-${centerAlign}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const backButton = (
    <Button
      className="s-page-nav__back"
      aria-label={backAriaLabel}
      hoverClass="s-page-nav__back--pressed"
      onTap={handleBack}
    >
      <ChevronLeft size={22} />
    </Button>
  );

  const trailingSlot = (
    <View
      className={[
        's-page-nav__trailing',
        !trailing ? 's-page-nav__trailing--placeholder' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {trailing ?? null}
    </View>
  );

  return (
    <View data-cmp="PageNavigation" className={rootClass} style={headerStyle}>
      {usePageCenterTitle ? (
        <>
          <View className="s-page-nav__toolbar">
            {backButton}
            {title ? (
              <View className="s-page-nav__title-wrap">
                <Text className="s-page-nav__title s-line-clamp-1">{title}</Text>
              </View>
            ) : null}
            {trailingSlot}
          </View>
          {meta ? (
            <Text className="s-page-nav__meta s-line-clamp-1">{meta}</Text>
          ) : null}
        </>
      ) : (
        <>
          {backButton}
          {center ? (
            <View className="s-page-nav__main">{center}</View>
          ) : (
            <View className="s-page-nav__main" aria-hidden />
          )}
          {trailingSlot}
        </>
      )}
    </View>
  );
};

export default PageNavigation;
