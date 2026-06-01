import { useEffect } from 'react';
import { EventLiveInfoPanel } from '../components/EventLiveInfoPanel';
import { useEventLiveInfo, type PublishLiveInfoPayload } from '../useEventLiveInfo';

export type EventLiveInfoTabActions = {
  publishUpdate: (payload: PublishLiveInfoPayload) => Promise<boolean>;
};

export type EventLiveInfoTabProps = {
  eventId: number;
  userName: string;
  onFeedCountChange?: (count: number) => void;
  onOpenUpdate: () => void;
  onLiveInfoActions?: (actions: EventLiveInfoTabActions | null) => void;
};

export function EventLiveInfoTab({
  eventId,
  userName,
  onFeedCountChange,
  onOpenUpdate,
  onLiveInfoActions,
}: EventLiveInfoTabProps) {
  const liveInfo = useEventLiveInfo(eventId, userName, { enabled: true });

  useEffect(() => {
    onFeedCountChange?.(liveInfo.liveInfoCount);
  }, [liveInfo.liveInfoCount, onFeedCountChange]);

  useEffect(() => {
    onLiveInfoActions?.({ publishUpdate: liveInfo.publishUpdate });
    return () => onLiveInfoActions?.(null);
  }, [liveInfo.publishUpdate, onLiveInfoActions]);

  return (
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
      onUploadWristband={() => void liveInfo.uploadWristband()}
      onReuploadWristband={() => void liveInfo.reuploadWristband()}
      onOpenUpdate={onOpenUpdate}
      onToggleLike={liveInfo.toggleFeedLike}
    />
  );
}
