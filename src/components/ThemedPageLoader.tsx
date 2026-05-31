import "./ThemedPageLoader.scss";
import { Text, View } from "@tarojs/components";
import { SyncBrandMark } from "./SyncBrandMark";

export type ThemedPageLoaderVariant =
  | "spinner"
  | "inline"
  | "skeleton-event"
  | "skeleton-event-posts"
  | "skeleton-live-feed"
  | "skeleton-feed"
  | "skeleton-ai-chat";

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

function EventPostSkeletonRow({ rows = 3 }: { rows?: number }) {
  return (
    <View className="s-themed-loader__event-post">
      <View className="s-themed-loader__post-row">
        <View className="s-themed-loader__chip s-themed-loader__chip--avatar" />
        <SkeletonBlocks rows={rows} />
      </View>
    </View>
  );
}

function EventPostsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="s-themed-loader__event-posts" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <EventPostSkeletonRow key={index} rows={index === 0 ? 3 : 2} />
      ))}
    </View>
  );
}

function LiveFeedSkeleton() {
  return (
    <View className="s-themed-loader__live-feed" aria-hidden>
      {Array.from({ length: 3 }, (_, index) => (
        <View key={index} className="s-themed-loader__live-card">
          <View className="s-themed-loader__chip s-themed-loader__chip--live-thumb" />
          <View className="s-themed-loader__live-copy">
            <View className="s-themed-loader__chip s-themed-loader__chip--title" />
            <SkeletonBlocks rows={2} />
          </View>
        </View>
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
      <View className="s-themed-loader__event-feed-divider" />
      <View className="s-themed-loader__chip s-themed-loader__chip--itinerary" />
      <View className="s-themed-loader__event-tabs">
        <View className="s-themed-loader__chip s-themed-loader__chip--tab" />
        <View className="s-themed-loader__chip s-themed-loader__chip--tab" />
      </View>
      <EventPostSkeletonRow rows={3} />
      <EventPostSkeletonRow rows={2} />
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

function AiChatSkeleton() {
  return (
    <View className="s-themed-loader__ai-chat" aria-hidden>
      <View className="s-themed-loader__ai-chat-messages">
        <View className="s-themed-loader__ai-chat-row s-themed-loader__ai-chat-row--ai">
          <View className="s-themed-loader__chip s-themed-loader__chip--ai-avatar" />
          <View className="s-themed-loader__ai-chat-bubble s-themed-loader__ai-chat-bubble--ai">
            <SkeletonBlocks rows={3} />
          </View>
        </View>
        <View className="s-themed-loader__ai-chat-row s-themed-loader__ai-chat-row--user">
          <View className="s-themed-loader__ai-chat-bubble s-themed-loader__ai-chat-bubble--user">
            <SkeletonBlocks rows={2} />
          </View>
          <View className="s-themed-loader__chip s-themed-loader__chip--avatar" />
        </View>
        <View className="s-themed-loader__ai-chat-row s-themed-loader__ai-chat-row--ai">
          <View className="s-themed-loader__chip s-themed-loader__chip--ai-avatar" />
          <View className="s-themed-loader__ai-chat-bubble s-themed-loader__ai-chat-bubble--ai s-themed-loader__ai-chat-bubble--short">
            <SkeletonBlocks rows={2} />
          </View>
        </View>
      </View>
      <View className="s-themed-loader__ai-chat-composer">
        <View className="s-themed-loader__ai-chat-chips">
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-chip" />
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-chip" />
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-chip" />
        </View>
        <View className="s-themed-loader__ai-chat-input-row">
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-icon" />
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-input" />
          <View className="s-themed-loader__chip s-themed-loader__chip--composer-icon" />
        </View>
      </View>
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
      {variant === "skeleton-event-posts" ? <EventPostsSkeleton /> : null}
      {variant === "skeleton-live-feed" ? <LiveFeedSkeleton /> : null}
      {variant === "skeleton-feed" ? <FeedSkeleton /> : null}
      {variant === "skeleton-ai-chat" ? <AiChatSkeleton /> : null}
      {variant === "spinner" || variant === "inline" ? <PinkSpinner /> : null}
      {label ? <Text className="s-themed-loader__label">{label}</Text> : null}
    </View>
  );
}
