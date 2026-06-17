import './exclusive-itinerary.scss';
import { Info } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { ScrollView, View } from '@tarojs/components';
import ActionSheet from '../../../components/ActionSheet';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { ExclusiveItineraryInfoModal } from './ExclusiveItineraryInfoModal';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { ExclusiveItineraryConflictBanner } from './ExclusiveItineraryConflictBanner';
import ExclusiveItineraryDjGrid from './components/ExclusiveItineraryDjGrid';
import ExclusiveItineraryFooter from './components/ExclusiveItineraryFooter';
import { useExclusiveItineraryPage } from './useExclusiveItineraryPage';

const ExclusiveItineraryPage = () => {
  useEndRouteTransitionOnShow();
  const {
    navFallback,
    mainScrollHeight,
    conflicts,
    showConflictBanner,
    onDismissConflicts,
    stageFilter,
    genreFilter,
    styleSearchQuery,
    stageOptions,
    genreOptions,
    sortMode,
    selectedIds,
    filteredDjs,
    setStageFilter,
    setGenreFilter,
    setStyleSearchQuery,
    toggleDj,
    openSortSheet,
    closeSortSheet,
    openInfo,
    closeModal,
    handleGenerate,
    sortSheetItems,
    sortSheetOpen,
    infoOpen,
    hintModal,
    generating,
    djListLoading,
    djListError,
    refetchDjList,
    scrollIntoViewId,
  } = useExclusiveItineraryPage();

  return (
    <View data-cmp="ExclusiveItineraryPage" className="s-exclusive-itinerary">
      <PageNavigation
        title="我的电音时间表"
        fallback={navFallback}
        trailing={
          <Button
            className="s-page-nav__icon-action"
            aria-label="说明"
            hoverClass="s-page-nav__icon-action--pressed"
            onTap={openInfo}
          >
            <Info size={18} />
          </Button>
        }
      />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        scrollIntoView={scrollIntoViewId}
        scrollWithAnimation
        className="s-exclusive-itinerary__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-exclusive-itinerary__inner">
          {showConflictBanner ? (
            <ExclusiveItineraryConflictBanner
              conflicts={conflicts}
              onDismiss={onDismissConflicts}
            />
          ) : null}

          {djListLoading ? (
            <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
          ) : djListError ? (
            <View
              className="s-exclusive-itinerary__load-error"
              onClick={() => void refetchDjList()}
              role="button"
              aria-label="阵容加载失败，点击重试"
            >
              阵容加载失败，点击重试
            </View>
          ) : (
            <ExclusiveItineraryDjGrid
              selectedCount={selectedIds.length}
              stageFilter={stageFilter}
              genreFilter={genreFilter}
              styleSearchQuery={styleSearchQuery}
              stageOptions={stageOptions}
              genreOptions={genreOptions}
              sortMode={sortMode}
              filteredDjs={filteredDjs}
              selectedIds={selectedIds}
              onStageFilterChange={setStageFilter}
              onGenreFilterChange={setGenreFilter}
              onStyleSearchQueryChange={setStyleSearchQuery}
              onOpenSortSheet={openSortSheet}
              onToggleDj={toggleDj}
            />
          )}
        </View>
      </ScrollView>

      <ExclusiveItineraryFooter
        selectedCount={selectedIds.length}
        generating={generating}
        onGenerate={handleGenerate}
      />

      <ExclusiveItineraryInfoModal
        open={infoOpen || hintModal != null}
        onClose={closeModal}
        title={hintModal?.title}
        message={hintModal?.message}
        confirmText={hintModal?.confirmText}
        secondaryCta={hintModal?.secondaryCta}
        showIcon={hintModal?.showIcon ?? hintModal == null}
      />

      <ActionSheet
        open={sortSheetOpen}
        title="排序方式"
        items={sortSheetItems}
        cancelLabel="取消"
        onCancel={closeSortSheet}
      />
    </View>
  );
};

export default ExclusiveItineraryPage;
