import "./TabPageHeader.scss";
import React, { type CSSProperties, type ReactNode } from "react";
import { Text, View } from "@tarojs/components";
import SyncBrandMark from "./SyncBrandMark";
import type { NavBarInsets } from "../hooks/useNavBarInsets";

export interface TabPageHeaderProps {
  /** Optional line below SYNC on the brand mark (e.g. events tab). */
  brandSubtitle?: string;
  /** Centered title; omit on profile and brand-only tabs. */
  title?: string;
  /** Right-side actions (notification, AI, count pill, etc.). */
  trailing?: ReactNode;
  /** Nav bar insets from useNavBarInsets(); applied when set. */
  navInsets?: NavBarInsets;
  /**
   * Subtract from paddingRight when the parent already has horizontal gutter
   * (e.g. home scroll inner uses --s-page-gutter).
   */
  paddingRightGutterPx?: number;
  className?: string;
  style?: CSSProperties;
}

/** Top bar style for tab root pages (status bar + capsule). */
export function tabPageHeaderStyle(
  insets: NavBarInsets,
  options?: { paddingRightGutterPx?: number },
): CSSProperties | undefined {
  const gutter = options?.paddingRightGutterPx ?? 0;
  const paddingRight = Math.max(0, insets.paddingRight - gutter);

  if (insets.paddingTop <= 0 && paddingRight <= 16) {
    return undefined;
  }

  return {
    ...(insets.paddingTop > 0 ? { paddingTop: `${insets.paddingTop}px` } : {}),
    ...(paddingRight > 16 ? { paddingRight: `${paddingRight}px` } : {}),
  };
}

/** Tab root page top bar: SYNC brand left, optional centered title, trailing actions. */
const TabPageHeader: React.FC<TabPageHeaderProps> = ({
  brandSubtitle,
  title,
  trailing,
  navInsets,
  paddingRightGutterPx = 0,
  className,
  style,
}) => {
  const insetStyle =
    navInsets != null ? tabPageHeaderStyle(navInsets, { paddingRightGutterPx }) : undefined;

  const rootClass = ["s-tab-page-header", title ? "s-tab-page-header--with-title" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <View data-cmp="TabPageHeader" className={rootClass} style={{ ...insetStyle, ...style }}>
      <View className="s-tab-page-header__brand">
        <SyncBrandMark subtitle={brandSubtitle} />
      </View>

      {title ? <Text className="s-tab-page-header__title s-line-clamp-1">{title}</Text> : null}

      {trailing != null ? <View className="s-tab-page-header__trailing">{trailing}</View> : null}
    </View>
  );
};

export default TabPageHeader;
