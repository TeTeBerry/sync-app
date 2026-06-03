import { Zap } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import type {
  LiveInfoCertStatus,
  LiveInfoFeedFilters,
} from '../../../../types/backend';
import type { LiveInfoZone } from '../../../../types/backend';
import type { LiveInfoFeedItem, LiveInfoSummaryRow } from '../liveInfoMock';
import { EventLiveInfoCertCard } from './EventLiveInfoCertCard';
import { OnSiteVerificationInfoCard } from './OnSiteVerificationInfoCard';
import { EventLiveInfoFeed } from './EventLiveInfoFeed';
import { EventLiveInfoFeedFilters } from './EventLiveInfoFeedFilters';
import { EventLiveInfoSummaryCard } from './EventLiveInfoSummaryCard';

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
  zones: LiveInfoZone[];
  filters: LiveInfoFeedFilters;
  filtersActive: boolean;
  filterSubtitle?: string;
  onFiltersChange: (next: LiveInfoFeedFilters) => void;
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
  zones,
  filters,
  filtersActive,
  filterSubtitle,
  onFiltersChange,
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
      <OnSiteVerificationInfoCard />
      <EventLiveInfoSummaryCard
        rows={summary}
        certCount={certCount}
        filterSubtitle={filterSubtitle}
      />
      <EventLiveInfoFeedFilters
        zones={zones}
        filters={filters}
        onChange={onFiltersChange}
      />
      <EventLiveInfoFeed
        items={feed}
        filtersActive={filtersActive}
        onToggleLike={onToggleLike}
      />
      {isCertified ? (
        <Button
          className="s-live-info-panel__fab"
          hoverClass="s-live-info-panel__fab--pressed"
          onClick={onOpenUpdate}
        >
          <Zap size={18} color="#fff" aria-hidden />
          <Text className="s-live-info-panel__fab-text">我要更新现场实时资讯</Text>
        </Button>
      ) : null}
    </View>
  );
}
