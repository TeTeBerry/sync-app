import './exclusive-itinerary.scss';
import { Info } from 'lucide-react-taro';
import { Button } from '../../../components/ui';
import { ScrollView, View } from '@tarojs/components';
import ActionSheet from '../../../components/ActionSheet';
import PageNavigation from '../../../components/PageNavigation';
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
    sortMode,
    selectedIds,
    filteredDjs,
    setStageFilter,
    setGenreFilter,
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
  } = useExclusiveItineraryPage();

  return (
    <View data-cmp="ExclusiveItineraryPage" className="s-exclusive-itinerary">
      <PageNavigation
        title="专属电音行程"
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

          <ExclusiveItineraryDjGrid
            selectedCount={selectedIds.length}
            stageFilter={stageFilter}
            genreFilter={genreFilter}
            sortMode={sortMode}
            filteredDjs={filteredDjs}
            selectedIds={selectedIds}
            onStageFilterChange={setStageFilter}
            onGenreFilterChange={setGenreFilter}
            onOpenSortSheet={openSortSheet}
            onToggleDj={toggleDj}
          />
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
        showIcon={hintModal == null}
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
