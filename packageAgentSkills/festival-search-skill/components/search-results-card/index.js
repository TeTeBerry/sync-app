const {
  attachAiModeComponent,
  sendApiCall,
  notifyModelSelection,
  preloadRelatedDetailPage,
  openDetailPage,
  expirePreviousSearchCards,
} = require('../../../shared/componentModelContext');

const SKILL_ROOT = 'packageAgentSkills/festival-search-skill';

function enrichEvents(raw) {
  return (raw || []).map((ev) => ({
    ...ev,
    initial:
      String(ev.name || 'S')
        .trim()
        .charAt(0)
        .toUpperCase() || 'S',
  }));
}

Component({
  data: {
    events: [],
    totalMatched: 0,
    isCompareMode: false,
    singleEvent: null,
  },

  lifetimes: {
    created() {
      attachAiModeComponent(
        this,
        'search-results-card',
        function applySearchResults(sc) {
          expirePreviousSearchCards(this, SKILL_ROOT);
          const events = enrichEvents(sc.events);
          const totalMatched = sc.totalMatched ?? events.length;
          const isCompareMode = totalMatched > 1 || events.length > 1;
          const singleEvent = !isCompareMode && events.length === 1 ? events[0] : null;

          this.setData({ events, totalMatched, isCompareMode, singleEvent });
          console.info('[ai-mode] search-results-card setData', {
            totalMatched,
            isCompareMode,
          });

          const focus = singleEvent || events[0];
          if (focus?.legacyId) {
            const viewCtx = wx.modelContext.getViewContext(this);
            viewCtx.setRelatedPage({
              path: '/packageEvent/pages/event-detail/index',
              query: `legacyId=${focus.legacyId}`,
            });
            preloadRelatedDetailPage(
              this,
              'search-results-card',
              `packageEvent/pages/event-detail/index?legacyId=${focus.legacyId}`,
            );
          }
        },
      );
    },
  },

  methods: {
    onTapSingle() {
      const event = this.data.singleEvent;
      const legacyId = event?.legacyId;
      if (!legacyId) return;
      openDetailPage(
        this,
        'search-results-card',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
    },

    onTapEvent(e) {
      const legacyId = Number(e.currentTarget.dataset.legacyId);
      const name = e.currentTarget.dataset.name || '这场活动';
      if (!legacyId) return;

      notifyModelSelection(this, `用户选择了活动：${name}（legacyId=${legacyId}）`);
      preloadRelatedDetailPage(
        this,
        'search-results-card',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
      sendApiCall(this, 'search-results-card', `查看 ${name} 的活动详情`, 'getEvent', {
        activityLegacyId: legacyId,
      });
    },
  },
});
