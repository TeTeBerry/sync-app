const {
  attachAiModeComponent,
  sendApiCall,
  sendTextFollowUp,
  preloadRelatedDetailPage,
  openDetailPage,
  shareEventInTap,
  openEventLocation,
} = require('../../../shared/componentModelContext');

Component({
  data: {
    event: {},
    eventInitial: 'S',
    moreCount: 0,
    showLineupAction: false,
    showShareAction: false,
    showMapAction: false,
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'event-card', function applyEventCard(sc) {
        let event = {};
        let moreCount = 0;
        let showLineupAction = false;

        if (Array.isArray(sc.events)) {
          event = sc.events[0] || {};
          moreCount = Math.max(0, (sc.totalMatched ?? sc.events.length) - 1);
          this._cachedEvent = event.legacyId || event.name ? { ...event } : null;
        } else if (sc.legacyId || sc.name) {
          event = sc;
          this._cachedEvent = { ...sc };
          showLineupAction = !!sc.lineupPublished;
        } else if (Array.isArray(sc.artists)) {
          const cached = this._cachedEvent || {};
          const artistCount = sc.artists.length;
          event = {
            legacyId: sc.activityLegacyId || cached.legacyId,
            name: cached.name || '活动阵容',
            date: cached.date || '',
            location: cached.location || '',
            heroImageUrl: cached.heroImageUrl,
            latitude: cached.latitude,
            longitude: cached.longitude,
            lineupSummary:
              artistCount > 0 ? `共 ${artistCount} 位艺人` : '阵容尚未官宣',
          };
          showLineupAction = !!cached.lineupPublished;
        }

        const legacyId = event.legacyId || sc.activityLegacyId;
        this._eventSnapshot = { ...event, legacyId };
        const showShareAction = !!legacyId;
        const showMapAction =
          Number.isFinite(Number(event.latitude)) &&
          Number.isFinite(Number(event.longitude));

        const eventInitial =
          String(event.name || 'S')
            .trim()
            .charAt(0)
            .toUpperCase() || 'S';
        this.setData({
          event,
          eventInitial,
          moreCount,
          showLineupAction,
          showShareAction,
          showMapAction,
        });
        console.info('[ai-mode] event-card setData', {
          event,
          moreCount,
          showLineupAction,
        });

        if (legacyId) {
          const detailUrl = `packageEvent/pages/event-detail/index?legacyId=${legacyId}`;
          const viewCtx = wx.modelContext.getViewContext(this);
          viewCtx.setRelatedPage({
            path: '/packageEvent/pages/event-detail/index',
            query: `legacyId=${legacyId}`,
          });
          preloadRelatedDetailPage(this, 'event-card', detailUrl);
        }
      });
    },
  },

  methods: {
    onTapCard(e) {
      const legacyId = Number(e.currentTarget.dataset.legacyId);
      const name = e.currentTarget.dataset.name || '这场活动';
      if (!legacyId) {
        sendTextFollowUp(this, 'event-card', '打开活动列表查看更多电音节');
        return;
      }

      if (this.data.showLineupAction) {
        sendApiCall(this, 'event-card', `查看 ${name} 的阵容`, 'getLineup', {
          activityLegacyId: legacyId,
        });
        return;
      }

      openDetailPage(
        this,
        'event-card',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
    },

    onTapShare() {
      shareEventInTap(this._eventSnapshot || this.data.event);
    },

    onTapMap() {
      openEventLocation(this._eventSnapshot || this.data.event);
    },
  },
});
