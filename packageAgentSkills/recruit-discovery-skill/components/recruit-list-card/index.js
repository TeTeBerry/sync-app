const {
  attachAiModeComponent,
  openDetailPage,
  sendTextFollowUp,
} = require('../../../shared/componentModelContext');

const SKILL_ROOT = 'packageAgentSkills/recruit-discovery-skill';

function resolveActivity(sc, post) {
  const activity = sc.activity || {};
  return {
    name:
      activity.name ||
      activity.canonicalActivityName ||
      sc.canonicalActivityName ||
      sc.activityName ||
      '',
    date: activity.date || '',
    location: activity.location || '',
    heroImageUrl: activity.heroImageUrl || '',
    legacyId: activity.legacyId || post.activityLegacyId || sc.activityLegacyId || 0,
  };
}

Component({
  data: {
    post: {},
    moreCount: 0,
    isEmpty: false,
    emptyMessage: '',
    filterLabels: [],
    activityName: '',
    activityMeta: '',
    activityHeroImageUrl: '',
    sortLabel: '按发布时间降序',
    hasFilterBar: true,
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'recruit-list-card', function applyRecruitList(sc) {
        // Expire previous recruit-list-card instances so stale data
        // (e.g. from a wrong-activity retry) does not linger on screen.
        try {
          wx.modelContext.expireAllCards({
            componentPaths: [`${SKILL_ROOT}/components/recruit-list-card/index`],
            match: 'previous',
          });
        } catch (err) {
          console.info('[ai-mode] expirePreviousRecruitCards skipped', err);
        }

        const posts = sc.posts || [];
        const totalMatched = sc.totalMatched ?? posts.length;
        const isEmpty = totalMatched === 0 || posts.length === 0;
        const post = isEmpty ? {} : posts[0] || {};
        const moreCount = isEmpty ? 0 : Math.max(0, totalMatched - 1);
        const activity = resolveActivity(sc, post);
        const activityLegacyId = activity.legacyId;
        this._activityLegacyId = activityLegacyId;

        this.setData({
          post,
          moreCount,
          isEmpty,
          emptyMessage: isEmpty ? '暂无公开组队招募帖' : '',
          filterLabels: sc.filterLabels || [],
          activityName: activity.name,
          activityMeta: [activity.date, activity.location].filter(Boolean).join(' · '),
          activityHeroImageUrl: activity.heroImageUrl,
          sortLabel: sc.sortLabel || '按发布时间降序',
          hasFilterBar: true,
        });
        console.info('[ai-mode] recruit-list-card setData', { post, moreCount });

        if (activityLegacyId) {
          const viewCtx = wx.modelContext.getViewContext(this);
          viewCtx.setRelatedPage({
            path: '/packageEvent/pages/event-detail/index',
            query: `legacyId=${activityLegacyId}`,
          });
        }
      });
    },
  },

  methods: {
    onTap() {
      const legacyId = this._activityLegacyId || this.data.post?.activityLegacyId;
      if (!legacyId) {
        sendTextFollowUp(this, 'recruit-list-card', '打开活动列表查看公开招募');
        return;
      }
      openDetailPage(
        this,
        'recruit-list-card',
        `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
      );
    },
  },
});
