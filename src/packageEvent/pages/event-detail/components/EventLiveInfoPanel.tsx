import { Zap } from 'lucide-react-taro';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import type { LiveInfoCertStatus } from '../../../../types/backend';
import type { PublishLiveInfoPayload } from '../useEventLiveInfo';
import type { LiveInfoFeedItem, LiveInfoSummaryRow } from '../liveInfoMock';
import { EventLiveInfoCertCard } from './EventLiveInfoCertCard';
import { EventLiveInfoSummaryCard } from './EventLiveInfoSummaryCard';
import { EventLiveInfoFeed } from './EventLiveInfoFeed';

type EventLiveInfoPanelProps = {
  loading?: boolean;
  userName: string;
  isCertified: boolean;
  certStatus: LiveInfoCertStatus;
  certExpiryLabel: string;
  rejectReason?: string;
  summary: LiveInfoSummaryRow[];
  certCount: number;
  feed: LiveInfoFeedItem[];
  onUploadWristband: () => void;
  onReuploadWristband: () => void;
  onOpenUpdate: () => void;
  onToggleLike: (id: string) => void;
};

export function EventLiveInfoPanel({
  loading = false,
  userName,
  isCertified,
  certStatus,
  certExpiryLabel,
  rejectReason,
  summary,
  certCount,
  feed,
  onUploadWristband,
  onReuploadWristband,
  onOpenUpdate,
  onToggleLike,
}: EventLiveInfoPanelProps) {
  if (loading) {
    return (
      <View className="s-live-info-panel s-live-info-panel--loading">
        <ThemedPageLoader variant="skeleton-live-feed" minHeight={200} />
      </View>
    );
  }

  return (
    <View
      className={['s-live-info-panel', isCertified && 's-live-info-panel--with-fab']
        .filter(Boolean)
        .join(' ')}
    >
      <EventLiveInfoCertCard
        userName={userName}
        isCertified={isCertified}
        certStatus={certStatus}
        certExpiryLabel={certExpiryLabel}
        rejectReason={rejectReason}
        onUpload={onUploadWristband}
        onReupload={onReuploadWristband}
      />
      <EventLiveInfoSummaryCard rows={summary} certCount={certCount} />
      <EventLiveInfoFeed items={feed} onToggleLike={onToggleLike} />
      {isCertified ? (
        <Button
          className="s-live-info-panel__fab"
          hoverClass="s-live-info-panel__fab--pressed"
          onClick={onOpenUpdate}
        >
          <Zap size={18} color="#fff" aria-hidden />
          <Text className="s-live-info-panel__fab-text">我要更新实时资讯</Text>
        </Button>
      ) : null}
    </View>
  );
}

export type { PublishLiveInfoPayload };
