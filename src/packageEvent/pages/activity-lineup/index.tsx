import './activity-lineup.scss';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';
import { useCallback, useMemo, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useT } from '@/hooks/useI18n';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { Button } from '../../../components/ui';
import {
  ActivityUpdateSubscribeBanner,
  PerformanceBundleStaleBanner,
} from '@/domains/activity-info';
import { LazyArtistProfileSheet } from '@/domains/lineup-artist';
import { SET_VOTE_POSTER_CANVAS_ID } from '@/domains/set-vote';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useMeasuredElementHeight } from '../../../hooks/useMeasuredElementHeight';
import { goExclusiveItinerary, ROUTES } from '../../../utils/route';
import { LineupArtistGrid } from './components/LineupArtistGrid';
import { LineupGenreNav } from './components/LineupGenreNav';
import { LineupScheduleDay } from './components/LineupScheduleDay';
import { LineupSetVoteResults } from './components/LineupSetVoteResults';
import { LineupSetVoteShareTeaser } from './components/LineupSetVoteShareTeaser';
import { LineupSetVoteSubmitBar } from './components/LineupSetVoteSubmitBar';
import { LineupSetVoteToolbar } from './components/LineupSetVoteToolbar';
import { useActivityLineupPage } from './useActivityLineupPage';
import { useLineupSetVote } from './hooks/useLineupSetVote';
import { useLineupGenreNavigation } from './useLineupGenreNavigation';
import { lineupGenreNavDomId } from './utils/scrollLineupSection';

const SET_VOTE_SUBMIT_BAR_PX = 108;

const ActivityLineupPage = () => {
  useEndRouteTransitionOnShow(ROUTES.ACTIVITY_LINEUP);
  const t = useT();
  const { isConnected } = useNetworkStatus();
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  const {
    activityLegacyId,
    navFallback,
    pageTitle,
    mainScrollHeight,
    schedulePublished,
    lineupPublished,
    sessionGroups,
    lineupDjs,
    showFooterCta,
    loading,
    error,
    isOfflineBundle,
    bundleSavedAt,
    activity,
    refetch,
  } = useActivityLineupPage();

  const setVote = useLineupSetVote({
    activityLegacyId,
    lineupPublished,
    activityName: pageTitle,
    activityDate: activity?.date,
    lineupDjs,
  });

  const showLineupGrid = lineupPublished && !schedulePublished && lineupDjs.length > 0;
  const {
    scrollIntoViewId,
    activeGenreId,
    sortMode,
    setSortMode,
    handleGenreChipTap,
    handleMainScroll,
    showGenreNav,
  } = useLineupGenreNavigation(showLineupGrid ? lineupDjs : []);

  const measuredGenreNavHeight = useMeasuredElementHeight(`#${lineupGenreNavDomId}`, {
    enabled: showLineupGrid && showGenreNav,
    remeasureKey: lineupDjs.length,
    fallbackHeight: 88,
  });

  const voteSubmitBarPx = setVote.showSubmitBar ? SET_VOTE_SUBMIT_BAR_PX : 0;

  const lineupScrollHeight = useMemo(() => {
    if (mainScrollHeight == null) {
      return undefined;
    }
    let height = mainScrollHeight - voteSubmitBarPx;
    if (showLineupGrid && showGenreNav) {
      const navHeight = measuredGenreNavHeight ?? 88;
      height -= navHeight;
    }
    return Math.max(0, height);
  }, [
    mainScrollHeight,
    measuredGenreNavHeight,
    showGenreNav,
    showLineupGrid,
    voteSubmitBarPx,
  ]);

  const handleArtistPress = useCallback(
    (artistId: string) => {
      if (setVote.voteModeEnabled) {
        setVote.onToggleDj(artistId);
        return;
      }
      setSelectedArtistId(artistId);
    },
    [setVote],
  );

  const handleOpenExclusiveItinerary = () => {
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      return;
    }
    goExclusiveItinerary(activityLegacyId);
  };

  return (
    <View data-cmp="ActivityLineupPage" className="s-activity-lineup">
      <PageNavigation
        title={pageTitle || t('activityLineup.title')}
        fallback={navFallback}
      />

      {loading ? (
        <ThemedPageLoader variant="skeleton-feed" minHeight={320} />
      ) : error ? (
        <View
          className="s-activity-lineup__load-error"
          onClick={() => void refetch()}
          role="button"
        >
          {t(isConnected ? 'activityLineup.loadFailed' : 'activityLineup.offlineRetry')}
        </View>
      ) : (
        <>
          {isOfflineBundle && bundleSavedAt != null ? (
            <PerformanceBundleStaleBanner savedAt={bundleSavedAt} />
          ) : null}

          <LineupSetVoteToolbar
            enabled={setVote.enabled}
            voteModeEnabled={setVote.voteModeEnabled}
            selectedCount={setVote.selectedIds.length}
            maxSelection={setVote.maxSelection}
            onVoteModeChange={setVote.onVoteModeChange}
          />

          {showLineupGrid && showGenreNav ? (
            <LineupGenreNav
              artists={lineupDjs}
              activeGenreId={activeGenreId}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              onGenreChipTap={handleGenreChipTap}
            />
          ) : null}

          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            scrollWithAnimation
            scrollIntoView={scrollIntoViewId}
            onScroll={showLineupGrid ? () => handleMainScroll() : undefined}
            className="s-activity-lineup__scroll s-scrollbar-none"
            style={
              lineupScrollHeight != null
                ? { height: `${lineupScrollHeight}px` }
                : undefined
            }
          >
            <View className="s-activity-lineup__inner">
              {setVote.showShareTeaser && setVote.shareTeaser ? (
                <LineupSetVoteShareTeaser
                  activityName={setVote.shareTeaser.activityName}
                  voterPickNames={setVote.shareTeaser.voterPickNames}
                  topEntries={setVote.shareTeaser.topEntries}
                  onStartVote={setVote.onStartFromTeaser}
                />
              ) : null}

              {setVote.showResults ? (
                <LineupSetVoteResults
                  picks={setVote.picks}
                  entries={setVote.entries}
                  totalVoters={setVote.totalVoters}
                  revoteAllowedToday={setVote.revoteAllowedToday}
                  isWeapp={setVote.isWeapp}
                  onEditPicks={setVote.onEditPicks}
                  onSharePoster={setVote.onSharePoster}
                />
              ) : null}

              {!lineupPublished ? (
                <View className="s-activity-lineup__subscribe">
                  <ActivityUpdateSubscribeBanner
                    activityLegacyId={activityLegacyId}
                    activityTitle={pageTitle}
                    variant="hero"
                  />
                </View>
              ) : schedulePublished ? (
                <>
                  <View className="s-activity-lineup__card">
                    <Text className="s-activity-lineup__card-title">
                      {t('activityLineup.scheduleTitle')}
                    </Text>
                    <Text className="s-activity-lineup__card-hint">
                      {t('activityLineup.scheduleHint')}
                    </Text>
                  </View>
                  {sessionGroups.map((session) => (
                    <LineupScheduleDay
                      key={session.dateKey}
                      session={session}
                      onArtistPress={handleArtistPress}
                      voteMode={setVote.voteModeEnabled}
                      selectedArtistIds={setVote.selectedIds}
                    />
                  ))}
                </>
              ) : lineupDjs.length > 0 ? (
                <>
                  <View className="s-activity-lineup__card">
                    <Text className="s-activity-lineup__card-title">
                      {t('activityLineup.lineupTitle')}
                    </Text>
                    <Text className="s-activity-lineup__card-hint">
                      {setVote.voteModeEnabled
                        ? t('activityLineup.lineupVoteHint')
                        : t('activityLineup.lineupHint')}
                    </Text>
                  </View>
                  <LineupArtistGrid
                    artists={lineupDjs}
                    sortMode={sortMode}
                    onSortModeChange={setSortMode}
                    showSoloSort={!showGenreNav}
                    onArtistPress={handleArtistPress}
                    voteMode={setVote.voteModeEnabled}
                    selectedArtistIds={setVote.selectedIds}
                    voteCountByArtistId={setVote.voteCountByArtistId}
                  />
                </>
              ) : (
                <Text className="s-activity-lineup__load-error">
                  {t('activityLineup.empty')}
                </Text>
              )}
            </View>
          </ScrollView>

          <LineupSetVoteSubmitBar
            visible={setVote.showSubmitBar}
            submitting={setVote.submitting}
            syncGenres={setVote.syncGenres}
            onSyncGenresChange={setVote.onSyncGenresChange}
            onSubmit={setVote.onSubmit}
          />

          {showFooterCta ? (
            <View
              className="s-activity-lineup__footer"
              style={
                voteSubmitBarPx > 0
                  ? {
                      paddingBottom: `calc(12px + env(safe-area-inset-bottom, 0px) + ${voteSubmitBarPx}px)`,
                    }
                  : undefined
              }
            >
              <Button
                className="s-activity-lineup__footer-btn"
                hoverClass="s-activity-lineup__footer-btn--pressed"
                onTap={handleOpenExclusiveItinerary}
              >
                <Text className="s-activity-lineup__footer-btn-text">
                  {t('activityLineup.buildItineraryCta')}
                </Text>
              </Button>
            </View>
          ) : null}
        </>
      )}

      <LazyArtistProfileSheet
        open={Boolean(selectedArtistId) && !setVote.voteModeEnabled}
        artistId={selectedArtistId}
        onClose={() => setSelectedArtistId(null)}
      />

      <Canvas
        type="2d"
        id={SET_VOTE_POSTER_CANVAS_ID}
        className="s-activity-lineup__vote-poster-canvas"
      />
      <LoginInterceptHost />
    </View>
  );
};

export default ActivityLineupPage;
