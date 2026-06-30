const {
  attachAiModeComponent,
  sendApiCall,
  notifyModelSelection,
  preloadRelatedDetailPage,
  openDetailPage,
  expirePreviousSearchCards,
} = require('../../../shared/componentModelContext');

const SKILL_ROOT = 'packageAgentSkills/festival-search-skill';

Component({
  data: {
    events: [],
    totalMatched: 0,
  },

  lifetimes: {
    created() {
      attachAiModeComponent(
        this,
        'event-compare-strip',
        function applyCompareStrip(sc) {
          expirePreviousSearchCards(this, SKILL_ROOT);
          const events = (sc.events || []).map((ev) => ({
            ...ev,
            initial:
              String(ev.name || 'S')
                .trim()
                .charAt(0)
                .toUpperCase() || 'S',
          }));
          const totalMatched = sc.totalMatched ?? events.length;
          this.setData({ events, totalMatched });
          console.info('[ai-mode] event-compare-strip setData', { totalMatched });

          const first = events[0];
          if (first?.legacyId) {
            const viewCtx = wx.modelContext.getViewContext(this);
            viewCtx.setRelatedPage({
              path: '/packageEvent/pages/event-detail/index',
              query: `legacyId=${first.legacyId}`,
            });
            preloadRelatedDetailPage(
              this,
              'event-compare-strip',
              `packageEvent/pages/event-detail/index?legacyId=${first.legacyId}`,
            );
          }
        },
      );
    },
  },

  methods: {
    onTapEvent(e) {
      const legacyId = Number(e.currentTarget.dataset.legacyId);
      const name = e.currentTarget.dataset.name || '这场活动';
      if (!legacyId) return;

      notifyModelSelection(this, `用户选择了活动：${name}（legacyId=${legacyId}）`);
      preloadRelatedDetailPage(
        this,
        'event-compare-strip',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
      sendApiCall(this, 'event-compare-strip', `查看 ${name} 的活动详情`, 'getEvent', {
        activityLegacyId: legacyId,
      });
    },

    onOpenDetail(e) {
      const legacyId = Number(e.currentTarget.dataset.legacyId);
      if (!legacyId) return;
      openDetailPage(
        this,
        'event-compare-strip',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
    },
  },
});
