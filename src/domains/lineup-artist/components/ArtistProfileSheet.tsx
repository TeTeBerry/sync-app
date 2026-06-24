import './ArtistProfileSheet.scss';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, Image } from '@tarojs/components';
import { X } from '../../../components/icons';
import { Button, cn } from '../../../components/ui';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useT } from '@/hooks/useI18n';
import { useOverlayLock } from '../../../hooks/useOverlayLock';
import {
  useCatalogLineupArtistDetail,
  useLineupArtistActivities,
} from '../../../hooks/useSyncApi';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { thumbnailImageUrl } from '../../../utils/imageUrl';
import { goEventDetail } from '../../../utils/route';
import { compareActivitiesNearestFirst } from '../../../utils/activityStatus';
import { getCatalogArtistPrimaryGenreLabel } from '../../../utils/catalogLineupArtistGenres';
import { pickNearestUpcomingActivity } from '../utils/pickNearestUpcomingActivity';
import { ArtistActivityRow } from './ArtistActivityRow';

export type ArtistProfileSheetProps = {
  open: boolean;
  artistId: string | null;
  onClose: () => void;
  /** When true, leave room for the main tab bar (events tab only). */
  reserveTabBarSpace?: boolean;
};

function ArtistProfileSheetInner({
  open,
  artistId,
  onClose,
  reserveTabBarSpace = false,
}: ArtistProfileSheetProps) {
  const t = useT();
  const [bioExpanded, setBioExpanded] = useState(false);
  useOverlayLock(open);

  useEffect(() => {
    setBioExpanded(false);
  }, [artistId, open]);

  const enabled = open && Boolean(artistId?.trim());
  const {
    data: artist,
    isLoading: artistLoading,
    isError: artistError,
    refetch: refetchArtist,
  } = useCatalogLineupArtistDetail(artistId, { enabled });
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivities,
  } = useLineupArtistActivities(artistId, { enabled });

  const sortedActivities = useMemo(() => {
    if (!activities?.length) {
      return [];
    }
    return [...activities].sort((a, b) =>
      compareActivitiesNearestFirst(
        { date: a.date, title: a.name },
        { date: b.date, title: b.name },
      ),
    );
  }, [activities]);

  const nearestUpcoming = useMemo(
    () => pickNearestUpcomingActivity(sortedActivities),
    [sortedActivities],
  );

  const handleOpenActivity = useCallback(
    (legacyId: number) => {
      onClose();
      goEventDetail(legacyId);
    },
    [onClose],
  );

  const handleOpenNearest = useCallback(() => {
    if (!nearestUpcoming?.legacyId) {
      return;
    }
    handleOpenActivity(nearestUpcoming.legacyId);
  }, [handleOpenActivity, nearestUpcoming?.legacyId]);

  const handleRetry = useCallback(() => {
    void refetchArtist();
    void refetchActivities();
  }, [refetchActivities, refetchArtist]);

  if (!open || !artistId) {
    return null;
  }

  const thumbSrc = artist?.thumbnail
    ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.avatarMd, 1)
    : undefined;
  const heroBackdropSrc = artist?.thumbnail
    ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.listThumb, 1)
    : undefined;
  const isLoading = artistLoading || activitiesLoading;
  const isError = artistError || activitiesError;
  const profileSummary = artist?.profileSummary?.trim();
  const profileFull = artist?.profileFull?.trim();
  const hasExpandableBio = Boolean(
    profileFull && profileSummary && profileFull.length > profileSummary.length,
  );
  const bioText = bioExpanded
    ? profileFull || profileSummary || t('events.artistProfile.bioPlaceholder')
    : profileSummary || profileFull || t('events.artistProfile.bioPlaceholder');
  const representativeTracks = artist?.representativeTracks ?? [];
  const primaryGenre = artist ? getCatalogArtistPrimaryGenreLabel(artist) : '';
  const chineseAliases = artist?.chineseAliases ?? [];

  return (
    <View
      className={[
        's-overlay s-overlay--sheet s-artist-profile-sheet',
        reserveTabBarSpace ? 's-artist-profile-sheet--above-tabbar' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-artist-profile-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-profile-sheet-title"
        onClick={(event) => event.stopPropagation?.()}
      >
        <View className="s-artist-profile-sheet__handle" aria-hidden />
        <View className="s-artist-profile-sheet__top">
          <Text
            id="artist-profile-sheet-title"
            className="s-artist-profile-sheet__heading"
          >
            {t('events.artistProfile.title')}
          </Text>
          <Button
            className="s-artist-profile-sheet__close"
            plain
            hoverClass="s-artist-profile-sheet__close--pressed"
            aria-label={t('events.artistProfile.closeAria')}
            onClick={(event) => {
              event.stopPropagation?.();
              onClose();
            }}
          >
            <X size={22} color="#fff" aria-hidden />
          </Button>
        </View>

        {isLoading && !artist ? (
          <View className="s-artist-profile-sheet__loader-wrap">
            <Text className="s-artist-profile-sheet__loader-text">
              {t('events.artistProfile.loadingDjInfo')}
            </Text>
            <ThemedPageLoader variant="skeleton-feed" minHeight={220} />
          </View>
        ) : isError ? (
          <View className="s-artist-profile-sheet__state">
            <Text className="s-artist-profile-sheet__state-text">
              {t('events.artistProfile.loadFailed')}
            </Text>
            <Text
              className="s-artist-profile-sheet__state-action"
              onClick={handleRetry}
            >
              {t('common.retry')}
            </Text>
          </View>
        ) : (
          <>
            <View className="s-artist-profile-sheet__hero">
              {heroBackdropSrc ? (
                <View className="s-artist-profile-sheet__hero-backdrop" aria-hidden>
                  <Image
                    src={heroBackdropSrc}
                    className="s-artist-profile-sheet__hero-backdrop-img"
                    mode="aspectFill"
                  />
                  <View className="s-artist-profile-sheet__hero-backdrop-scrim" />
                </View>
              ) : null}
              <View className="s-artist-profile-sheet__hero-glow" aria-hidden />
              <View className="s-artist-profile-sheet__header">
                <View className="s-artist-profile-sheet__avatar-stage">
                  <View className="s-artist-profile-sheet__avatar-glow" aria-hidden />
                  <ImageWithFallback
                    src={thumbSrc}
                    alt={artist?.name ?? ''}
                    wrapperClassName="s-artist-profile-sheet__avatar"
                    imageClassName="s-artist-profile-sheet__avatar-img"
                    fallbackWrapperClassName="s-artist-profile-sheet__avatar s-artist-profile-sheet__avatar--fallback"
                    fallback={artist?.name?.slice(0, 2) ?? ''}
                  />
                </View>
                <View className="s-artist-profile-sheet__identity">
                  <View className="s-artist-profile-sheet__name-row">
                    <Text className="s-artist-profile-sheet__name">{artist?.name}</Text>
                    {artist?.activityCount != null ? (
                      <Text className="s-artist-profile-sheet__count-pill">
                        {t('events.artistActivityCount', {
                          count: artist.activityCount,
                        })}
                      </Text>
                    ) : null}
                  </View>
                  {artist?.genreLabel && artist.genreLabel !== '风格待补充' ? (
                    <Text className="s-artist-profile-sheet__genre">
                      {artist.genreLabel}
                    </Text>
                  ) : primaryGenre ? (
                    <Text className="s-artist-profile-sheet__genre">
                      {primaryGenre}
                    </Text>
                  ) : null}
                  {chineseAliases.length ? (
                    <Text className="s-artist-profile-sheet__aliases">
                      {t('events.artistProfile.aliasesLabel')}：
                      {chineseAliases.join('、')}
                    </Text>
                  ) : null}
                  <Text
                    className={[
                      's-artist-profile-sheet__bio',
                      !bioExpanded && hasExpandableBio ? 's-line-clamp-3' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {bioText}
                  </Text>
                  {hasExpandableBio ? (
                    <Text
                      className="s-artist-profile-sheet__bio-toggle"
                      onClick={() => setBioExpanded((value) => !value)}
                    >
                      {bioExpanded
                        ? t('events.artistProfile.bioCollapse')
                        : t('events.artistProfile.bioExpand')}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <ScrollView
              scrollY
              enhanced
              showScrollbar={false}
              className="s-artist-profile-sheet__scroll s-scrollbar-none"
              style={{ flex: 1, height: 0, minHeight: 0 }}
            >
              <View className="s-artist-profile-sheet__body">
                <View className="s-artist-profile-sheet__section-head">
                  <View className="s-artist-profile-sheet__section-accent" />
                  <Text className="s-artist-profile-sheet__section-title">
                    {t('events.artistProfile.appearancesTitle')}
                  </Text>
                  {sortedActivities.length ? (
                    <View className="s-artist-profile-sheet__section-count">
                      <Text className="s-artist-profile-sheet__section-count-text">
                        {sortedActivities.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {sortedActivities.length ? (
                  <View className="s-artist-profile-sheet__activities">
                    {sortedActivities.map((activity, index) => (
                      <ArtistActivityRow
                        key={activity.legacyId}
                        activity={activity}
                        highlight={index === 0 && Boolean(nearestUpcoming)}
                        onPress={() => handleOpenActivity(activity.legacyId)}
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="s-artist-profile-sheet__empty">
                    {t('events.artistProfile.appearancesEmpty')}
                  </Text>
                )}
                {representativeTracks.length ? (
                  <View className="s-artist-profile-sheet__tracks">
                    <View className="s-artist-profile-sheet__section-head">
                      <View className="s-artist-profile-sheet__section-accent" />
                      <Text className="s-artist-profile-sheet__section-title">
                        {t('events.artistProfile.representativeTracksTitle')}
                      </Text>
                    </View>
                    <View className="s-artist-profile-sheet__track-list">
                      {representativeTracks.map((track) => (
                        <Text
                          key={track}
                          className="s-artist-profile-sheet__track-item s-line-clamp-1"
                        >
                          {track}
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            </ScrollView>

            <View className="s-artist-profile-sheet__footer">
              <Button
                className={cn(
                  's-artist-profile-sheet__cta',
                  !nearestUpcoming && 's-artist-profile-sheet__cta--disabled',
                )}
                disabled={!nearestUpcoming}
                hoverClass={
                  nearestUpcoming ? 's-artist-profile-sheet__cta--pressed' : ''
                }
                onClick={handleOpenNearest}
              >
                <Text className="s-artist-profile-sheet__cta-text">
                  {t('events.artistProfile.ctaNearest')}
                </Text>
              </Button>
              <Text className="s-artist-profile-sheet__cta-hint">
                {nearestUpcoming
                  ? t('events.artistProfile.recruitHint')
                  : t('events.artistProfile.ctaDisabledHint')}
              </Text>
              <Text className="s-artist-profile-sheet__disclaimer">
                {t('events.artistProfile.disclaimer')}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export const ArtistProfileSheet = memo(ArtistProfileSheetInner);
