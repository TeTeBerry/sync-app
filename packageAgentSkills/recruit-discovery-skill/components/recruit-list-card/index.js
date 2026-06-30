const {
  attachAiModeComponent,
  openDetailPage,
  sendTextFollowUp,
} = require('../../../shared/componentModelContext');

Component({
  data: {
    post: {},
    moreCount: 0,
    isEmpty: false,
    emptyMessage: '',
    filterLabels: [],
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'recruit-list-card', function applyRecruitList(sc) {
        const posts = sc.posts || [];
        const totalMatched = sc.totalMatched ?? posts.length;
        const isEmpty = totalMatched === 0 || posts.length === 0;
        const post = isEmpty ? {} : posts[0] || {};
        const moreCount = isEmpty ? 0 : Math.max(0, totalMatched - 1);
        const activityLegacyId = post.activityLegacyId || sc.activityLegacyId || 0;
        this._activityLegacyId = activityLegacyId;

        this.setData({
          post,
          moreCount,
          isEmpty,
          emptyMessage: isEmpty ? '暂无公开组队招募帖' : '',
          filterLabels: sc.filterLabels || [],
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

    onTapDraft() {
      sendTextFollowUp(
        this,
        'recruit-list-card',
        '帮我为这个活动生成一条组队招募帖草稿',
      );
    },
  },
});
