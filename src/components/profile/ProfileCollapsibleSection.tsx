import React, { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp,  } from "lucide-react-taro";
import { useClientPagination } from "../../hooks/useClientPagination";
import { Button, Text, View } from '@tarojs/components';

const SECTION_VARIANTS = {
  activities: {
    modifier: "s-profile-section--activities",
    icon: "s-profile-section__icon--pink",
    badge: "s-profile-section__badge--pink",
  },
  posts: {
    modifier: "s-profile-section--posts",
    icon: "s-profile-section__icon--cyan",
    badge: "s-profile-section__badge--cyan",
  },
} as const;

export type ProfileCollapsibleSectionProps<T> = {
  variant: keyof typeof SECTION_VARIANTS;
  icon: React.ReactNode;
  title: string;
  items: T[];
  pageSize?: number;
  children: (pageItems: T[]) => React.ReactNode;
};

export function ProfileCollapsibleSection<T>({
  variant,
  icon,
  title,
  items,
  pageSize = 2,
  children,
}: ProfileCollapsibleSectionProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const { page, totalPages, pageItems, goPrev, goNext, resetPage } = useClientPagination(
    items,
    pageSize,
  );
  const styles = SECTION_VARIANTS[variant];

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
    resetPage();
  };

  return (
    <View
      className={[
        "s-profile-section",
        styles.modifier,
        expanded ? " s-profile-section--expanded" : "",
      ].join("")}
    >
      <View
        className="s-profile-section__header"
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <Text className="s-profile-section__header-left">
          <Text className={`s-profile-section__icon ${styles.icon}`}>{icon}</Text>
          <Text className="s-profile-section__title">{title}</Text>
          <Text className={`s-profile-section__badge ${styles.badge}`}>{items.length}</Text>
        </Text>

        <Text className="s-profile-section__header-right">
          {expanded ? (
            <Text
              className="s-profile-section__pagination"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                className="s-profile-section__page-btn"
                disabled={page === 0}
                aria-label="上一页"
                onClick={goPrev}
              >
                <ChevronLeft size={16} />
              </Button>
              <Text className="s-profile-section__page-label">
                {page + 1}/{totalPages}
              </Text>
              <Button
                type="button"
                className="s-profile-section__page-btn"
                disabled={page >= totalPages - 1}
                aria-label="下一页"
                onClick={goNext}
              >
                <ChevronRight size={16} />
              </Button>
            </Text>
          ) : null}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Text>
      </View>

      {expanded ? (
        <View className="s-profile-section__body">{children(pageItems)}</View>
      ) : null}
    </View>
  );
}
