import React, { lazy, Suspense } from 'react';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import type { EventLiveInfoTabActions } from '@/domains/live-info/components/EventLiveInfoTab';
const EventLiveInfoTab = lazy(() =>
  import('@/domains/live-info/components/EventLiveInfoTab').then((mod) => ({
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
  onCertifiedSuccess,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Suspense
      fallback={<ThemedPageLoader variant="skeleton-live-feed" minHeight={200} />}
    >
      <EventLiveInfoTab
        eventId={eventId}
        userName={userName}
        updateSheetOpen={updateSheetOpen}
        onFeedCountChange={onFeedCountChange}
        onOpenUpdate={onOpenUpdate}
        onLiveInfoActions={onLiveInfoActions}
        onCloseUpdateSheet={onCloseUpdateSheet}
        onCertifiedSuccess={onCertifiedSuccess}
      />
    </Suspense>
  );
};

export default EventDetailLiveSection;
