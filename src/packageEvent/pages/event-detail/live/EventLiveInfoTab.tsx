import { useEffect } from 'react';
import { EventLiveInfoPanel } from '../components/EventLiveInfoPanel';
import { EventLiveInfoUpdateSheet } from '../components/EventLiveInfoUpdateSheet';
import { useEventLiveInfo, type PublishLiveInfoPayload } from '../useEventLiveInfo';

export type EventLiveInfoTabActions = {
  publishUpdate: (payload: PublishLiveInfoPayload) => Promise<boolean>;
};

export type EventLiveInfoTabProps = {
  eventId: number;
  userName: string;
  updateSheetOpen?: boolean;
  onFeedCountChange?: (count: number) => void;
  onOpenUpdate: () => void;
  onCloseUpdateSheet?: () => void;
  onLiveInfoActions?: (actions: EventLiveInfoTabActions | null) => void;
  onCertifiedSuccess?: () => void | Promise<void>;
};

export function EventLiveInfoTab({
  eventId,
  userName,
  updateSheetOpen = false,
  onFeedCountChange,
  onOpenUpdate,
  onCloseUpdateSheet,
  onLiveInfoActions,
  onCertifiedSuccess,
}: EventLiveInfoTabProps) {
  const liveInfo = useEventLiveInfo(eventId, userName, {
    enabled: true,
    onCertifiedSuccess,
  });

  useEffect(() => {
    onFeedCountChange?.(liveInfo.liveInfoCount);
  }, [liveInfo.liveInfoCount, onFeedCountChange]);

  useEffect(() => {
    onLiveInfoActions?.({ publishUpdate: liveInfo.publishUpdate });
    return () => onLiveInfoActions?.(null);
  }, [liveInfo.publishUpdate, onLiveInfoActions]);

  return (
    <>
      <EventLiveInfoPanel
        loading={liveInfo.loading}
        userName={userName}
        isCertified={liveInfo.isCertified}
        certStatus={liveInfo.certStatus}
        certExpiryLabel={liveInfo.certExpiryLabel}
        rejectReason={liveInfo.rejectReason}
        summary={liveInfo.summary}
        certCount={liveInfo.certCount}
        feed={liveInfo.feed}
        zones={liveInfo.zones}
        filters={liveInfo.filters}
        filtersActive={liveInfo.filtersActive}
        filterSubtitle={liveInfo.filterSubtitle}
        onFiltersChange={(next) => {
          liveInfo.setFilters(next);
        }}
        onUploadWristband={() => void liveInfo.uploadWristband()}
        onReuploadWristband={() => void liveInfo.reuploadWristband()}
        onOpenUpdate={onOpenUpdate}
        onToggleLike={liveInfo.toggleFeedLike}
      />
      {updateSheetOpen ? (
        <EventLiveInfoUpdateSheet
          open
          zones={liveInfo.zones}
          onClose={() => onCloseUpdateSheet?.()}
          onPublish={liveInfo.publishUpdate}
        />
      ) : null}
    </>
  );
}
