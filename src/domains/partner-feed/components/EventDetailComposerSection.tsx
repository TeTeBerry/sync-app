import React from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { EventDetailAiTravelGuideCard } from '@/domains/travel-guide/components/EventDetailAiTravelGuideCard';
import { EventDetailMessageBoardComposer } from './EventDetailMessageBoardComposer';
import {
  EventDetailContentTabs,
  type EventDetailTabId,
} from './EventDetailContentTabs';
import { EventDetailItineraryMenu } from './EventDetailItineraryMenu';
import type { OnsiteBuddyPostIntentId } from '../../../constants/onsiteBuddyPostIntents';
import { View } from '@tarojs/components';

export type EventDetailComposerSectionProps = {
  showHeaderSkeleton: boolean;
  composerReady: boolean;
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
  messageImageRefs: string[];
  onPickMessageImages: () => void;
  onRemoveMessageImage: (index: number) => void;
  onPublishMessage: () => void;
  messagePublishing?: boolean;
  onAiGuideClick: () => void;
  onOpenTemplateSheet: () => void;
  templateDisabled?: boolean;
  isOnSite?: boolean;
  onOnsiteIntentClick?: (intentId: OnsiteBuddyPostIntentId) => void;
  onsitePublishDisabled?: boolean;
  activityTitle?: string;
  onOpenMyItinerary: () => void;
  onOpenExclusiveItinerary: () => void;
  contentTab: EventDetailTabId;
  onContentTabChange: (tab: EventDetailTabId) => void;
  boardCount: number;
  liveCount: number;
};

export const EventDetailComposerSection: React.FC<EventDetailComposerSectionProps> = ({
  showHeaderSkeleton,
  composerReady,
  messageDraft,
  onMessageDraftChange,
  messageImageRefs,
  onPickMessageImages,
  onRemoveMessageImage,
  onPublishMessage,
  messagePublishing,
  onAiGuideClick,
  onOpenTemplateSheet,
  templateDisabled,
  isOnSite,
  onOnsiteIntentClick,
  onsitePublishDisabled,
  activityTitle,
  onOpenMyItinerary,
  onOpenExclusiveItinerary,
  contentTab,
  onContentTabChange,
  boardCount,
  liveCount,
}) => {
  if (showHeaderSkeleton) {
    return <ThemedPageLoader variant="skeleton-event" minHeight={360} />;
  }

  return (
    <>
      {composerReady ? (
        <>
          <EventDetailAiTravelGuideCard onClick={onAiGuideClick} />
          <EventDetailMessageBoardComposer
            draft={messageDraft}
            onDraftChange={onMessageDraftChange}
            imageRefs={messageImageRefs}
            onPickImages={onPickMessageImages}
            onRemoveImage={onRemoveMessageImage}
            onPublish={onPublishMessage}
            onOpenTemplateSheet={onOpenTemplateSheet}
            templateDisabled={templateDisabled}
            isOnSite={isOnSite}
            onOnsiteIntentClick={onOnsiteIntentClick}
            onsitePublishDisabled={onsitePublishDisabled}
            publishing={messagePublishing}
          />
        </>
      ) : null}
      <View className="s-event-detail__feed-section">
        <EventDetailItineraryMenu
          activityTitle={activityTitle}
          onOpenMyItinerary={onOpenMyItinerary}
          onOpenExclusiveItinerary={onOpenExclusiveItinerary}
        />
        <EventDetailContentTabs
          active={contentTab}
          boardCount={boardCount}
          liveCount={liveCount}
          onChange={onContentTabChange}
        />
      </View>
    </>
  );
};
