import './activity-lineup.scss';
import { ScrollView, Text, View } from '@tarojs/components';
import { useMemo } from 'react';
import { useT } from '@/hooks/useI18n';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { Button } from '../../../components/ui';
import { ActivityUpdateSubscribeBanner } from '@/domains/activity-info/components/ActivityUpdateSubscribeBanner';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useMeasuredElementHeight } from '../../../hooks/useMeasuredElementHeight';
import { goExclusiveItinerary, ROUTES } from '../../../utils/route';
import { LineupArtistGrid } from './components/LineupArtistGrid';
import { LineupGenreNav } from './components/LineupGenreNav';
import { LineupScheduleDay } from './components/LineupScheduleDay';
import { useActivityLineupPage } from './useActivityLineupPage';
import { useLineupGenreNavigation } from './useLineupGenreNavigation';
import { lineupGenreNavDomId } from './utils/scrollLineupSection';

const ActivityLineupPage = () => {
  useEndRouteTransitionOnShow(ROUTES.ACTIVITY_LINEUP);
  const t = useT();

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
    refetch,
  } = useActivityLineupPage();

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

  const lineupScrollHeight = useMemo(() => {
    if (mainScrollHeight == null) {
      return undefined;
    }
    if (!showLineupGrid || !showGenreNav) {
      return mainScrollHeight;
    }
    const navHeight = measuredGenreNavHeight ?? 88;
    return Math.max(0, mainScrollHeight - navHeight);
  }, [mainScrollHeight, measuredGenreNavHeight, showGenreNav, showLineupGrid]);

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
          {t('activityLineup.loadFailed')}
        </View>
      ) : (
        <>
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
                    <LineupScheduleDay key={session.dateKey} session={session} />
                  ))}
                </>
              ) : lineupDjs.length > 0 ? (
                <>
                  <View className="s-activity-lineup__card">
                    <Text className="s-activity-lineup__card-title">
                      {t('activityLineup.lineupTitle')}
                    </Text>
                    <Text className="s-activity-lineup__card-hint">
                      {t('activityLineup.lineupHint')}
                    </Text>
                  </View>
                  <LineupArtistGrid
                    artists={lineupDjs}
                    sortMode={sortMode}
                    onSortModeChange={setSortMode}
                    showSoloSort={!showGenreNav}
                  />
                </>
              ) : (
                <Text className="s-activity-lineup__load-error">
                  {t('activityLineup.empty')}
                </Text>
              )}
            </View>
          </ScrollView>

          {showFooterCta ? (
            <View className="s-activity-lineup__footer">
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
    </View>
  );
};

export default ActivityLineupPage;
