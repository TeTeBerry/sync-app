import "./ThemedPageLoader.scss";
import { Text, View } from "@tarojs/components";
import { SyncBrandMark } from "./SyncBrandMark";

export type ThemedPageLoaderVariant =
  | "spinner"
  | "inline"
  | "skeleton-event"
  | "skeleton-feed";

type ThemedPageLoaderProps = {
  variant?: ThemedPageLoaderVariant;
  /** Full-screen overlay (destination pages during first paint). */
  overlay?: boolean;
  label?: string;
  /** Subtle SYNC mark on full-screen navigation loader. */
  showBrand?: boolean;
  className?: string;
  minHeight?: number;
};

function SkeletonBlocks({ rows = 3 }: { rows?: number }) {
  return (
    <View className="s-themed-loader__skeleton-blocks" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          className="s-themed-loader__skeleton-line"
          style={{ width: index === rows - 1 ? "62%" : "100%" }}
        />
      ))}
    </View>
  );
}

function EventDetailSkeleton() {
  return (
    <View className="s-themed-loader__event" aria-hidden>
      <View className="s-themed-loader__event-header">
        <View className="s-themed-loader__chip s-themed-loader__chip--round" />
        <View className="s-themed-loader__event-title-block">
          <View className="s-themed-loader__chip s-themed-loader__chip--title" />
          <View className="s-themed-loader__chip s-themed-loader__chip--meta" />
        </View>
        <View className="s-themed-loader__chip s-themed-loader__chip--round" />
      </View>
      <View className="s-themed-loader__event-ai">
        <SkeletonBlocks rows={2} />
      </View>
      <View className="s-themed-loader__event-post">
        <View className="s-themed-loader__post-row">
          <View className="s-themed-loader__chip s-themed-loader__chip--avatar" />
          <SkeletonBlocks rows={3} />
        </View>
      </View>
      <View className="s-themed-loader__event-post">
        <View className="s-themed-loader__post-row">
          <View className="s-themed-loader__chip s-themed-loader__chip--avatar" />
          <SkeletonBlocks rows={2} />
        </View>
      </View>
    </View>
  );
}

function FeedSkeleton() {
  return (
    <View className="s-themed-loader__feed" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} className="s-themed-loader__feed-row">
          <View className="s-themed-loader__chip s-themed-loader__chip--icon" />
          <View className="s-themed-loader__feed-copy">
            <View className="s-themed-loader__chip s-themed-loader__chip--title" />
            <View className="s-themed-loader__chip s-themed-loader__chip--body" />
          </View>
        </View>
      ))}
    </View>
  );
}

function PinkSpinner() {
  return (
    <View className="s-themed-loader__spinner-wrap" aria-hidden>
      <View className="s-themed-loader__spinner" />
    </View>
  );
}

export default function ThemedPageLoader({
  variant = "spinner",
  overlay = false,
  label,
  showBrand = false,
  className,
  minHeight = 120,
}: ThemedPageLoaderProps) {
  const rootClass = [
    "s-themed-loader",
    overlay ? "s-themed-loader--overlay" : "",
    variant !== "spinner" && variant !== "inline" ? "s-themed-loader--skeleton" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View
      className={rootClass}
      style={{ minHeight: overlay ? undefined : minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "加载中"}>
      {showBrand ? (
        <SyncBrandMark className="s-themed-loader__brand" />
      ) : null}
      {variant === "skeleton-event" ? <EventDetailSkeleton /> : null}
      {variant === "skeleton-feed" ? <FeedSkeleton /> : null}
      {variant === "spinner" || variant === "inline" ? <PinkSpinner /> : null}
      {label ? <Text className="s-themed-loader__label">{label}</Text> : null}
    </View>
  );
}
