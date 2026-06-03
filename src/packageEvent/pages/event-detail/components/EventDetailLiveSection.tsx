import React, { lazy, Suspense } from 'react';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import { EventLiveInfoUpdateSheet } from './EventLiveInfoUpdateSheet';
import type { EventLiveInfoTabActions } from '../live/EventLiveInfoTab';
import type { PublishLiveInfoPayload } from '../useEventLiveInfo';

const EventLiveInfoTab = lazy(() =>
  import('../live/EventLiveInfoTab').then((mod) => ({
    default: mod.EventLiveInfoTab,
  })),
);

export type EventDetailLiveSectionProps = {
  visible: boolean;
  eventId: number;
  userName: string;
  updateSheetOpen: boolean;
  onFeedCountChange: (count: number) => void;
  onOpenUpdate: () => void;
  onLiveInfoActions: (actions: EventLiveInfoTabActions | null) => void;
  onCloseUpdateSheet: () => void;
  onPublishUpdate: (payload: PublishLiveInfoPayload) => Promise<boolean>;
  onCertifiedSuccess?: () => void | Promise<void>;
};

const EventDetailLiveSection: React.FC<EventDetailLiveSectionProps> = ({
  visible,
  eventId,
  userName,
  updateSheetOpen,
  onFeedCountChange,
  onOpenUpdate,
  onLiveInfoActions,
  onCloseUpdateSheet,
  onPublishUpdate,
  onCertifiedSuccess,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <>
      <Suspense
        fallback={<ThemedPageLoader variant="skeleton-live-feed" minHeight={200} />}
      >
        <EventLiveInfoTab
          eventId={eventId}
          userName={userName}
          onFeedCountChange={onFeedCountChange}
          onOpenUpdate={onOpenUpdate}
          onLiveInfoActions={onLiveInfoActions}
          onCertifiedSuccess={onCertifiedSuccess}
        />
      </Suspense>
      {updateSheetOpen ? (
        <EventLiveInfoUpdateSheet
          open
          onClose={onCloseUpdateSheet}
          onPublish={onPublishUpdate}
        />
      ) : null}
    </>
  );
};

export default EventDetailLiveSection;
