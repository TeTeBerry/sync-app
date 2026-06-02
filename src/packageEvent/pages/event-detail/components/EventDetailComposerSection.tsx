import React from 'react';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import { EventDetailAiMatchCard } from './EventDetailAiMatchCard';
import {
  EventDetailContentTabs,
  type EventDetailTabId,
} from './EventDetailContentTabs';
import { EventDetailExclusiveItineraryButton } from './EventDetailExclusiveItineraryButton';
import { View } from '@tarojs/components';

export type EventDetailComposerSectionProps = {
  showHeaderSkeleton: boolean;
  composerReady: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  onAiSubmit: () => void;
  onShortcutTag: (tag: string) => void;
  onAiGuideClick: () => void;
  onBuddyPostClick: () => void;
  buddyPostDisabled?: boolean;
  onOpenExclusiveItinerary: () => void;
  contentTab: EventDetailTabId;
  onContentTabChange: (tab: EventDetailTabId) => void;
  postsCount: number;
  liveCount: number;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  showHeaderSkeleton,
  composerReady,
  prompt,
  onPromptChange,
  onAiSubmit,
  onShortcutTag,
  onAiGuideClick,
  onBuddyPostClick,
  buddyPostDisabled,
  onOpenExclusiveItinerary,
  contentTab,
  onContentTabChange,
  postsCount,
  liveCount,
}) => {
  if (showHeaderSkeleton) {
    return <ThemedPageLoader variant="skeleton-event" minHeight={360} />;
  }

  return (
    <>
      {composerReady ? (
        <EventDetailAiMatchCard
          prompt={prompt}
          onPromptChange={onPromptChange}
          onSubmit={onAiSubmit}
          onTagClick={onShortcutTag}
          onAiGuideClick={onAiGuideClick}
          onBuddyPostClick={onBuddyPostClick}
          buddyPostDisabled={buddyPostDisabled}
        />
      ) : null}
      <View className="s-event-detail__feed-section">
        <EventDetailExclusiveItineraryButton onPress={onOpenExclusiveItinerary} />
        <EventDetailContentTabs
          active={contentTab}
          postsCount={postsCount}
          liveCount={liveCount}
          onChange={onContentTabChange}
        />
      </View>
    </>
  );
};
