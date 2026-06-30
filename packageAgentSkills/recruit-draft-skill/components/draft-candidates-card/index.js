const {
  attachAiModeComponent,
  openDetailPage,
  sendTextFollowUp,
} = require('../../../shared/componentModelContext');

function buildFormSummary(formData) {
  if (!formData) return '';
  const parts = [];
  if (formData.location) parts.push(`${formData.location}出发`);
  if (formData.dateStart && formData.dateEnd) {
    parts.push(`${formData.dateStart} 至 ${formData.dateEnd}`);
  } else if (formData.dateStart) {
    parts.push(formData.dateStart);
  }
  if (formData.headcount) parts.push(`${formData.headcount}人`);
  return parts.join(' · ');
}

Component({
  data: {
    candidateCount: 0,
    previewText: '',
    formSummary: '',
    isError: false,
    errorMessage: '',
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'draft-candidates-card', function applyDraft(sc) {
        if (sc._error) {
          this._activityLegacyId = 0;
          this._artifactId = '';
          this.setData({
            isError: true,
            errorMessage: sc.message || '生成失败，请先登录后重试',
            candidateCount: 0,
            previewText: '',
          });
          console.info('[ai-mode] draft-candidates-card error', sc.message);
          return;
        }

        const preview = sc.preview || {};
        const candidates = preview.candidates || [];
        const activityLegacyId = preview.activityLegacyId || sc.activityLegacyId || 0;
        const artifactId = sc.artifactId || '';
        this._activityLegacyId = activityLegacyId;
        this._artifactId = artifactId;

        this.setData({
          isError: false,
          errorMessage: '',
          candidateCount: candidates.length,
          previewText: candidates[0]?.text || preview.disclaimer || '',
          formSummary: buildFormSummary(sc.formData),
        });
        console.info('[ai-mode] draft-candidates-card setData');

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
      const legacyId = this._activityLegacyId;
      const artifactId = this._artifactId;
      if (!legacyId) {
        sendTextFollowUp(this, 'draft-candidates-card', '打开活动列表选择要组队的节');
        return;
      }
      const query = [`legacyId=${legacyId}`];
      if (artifactId) {
        query.push(`artifactId=${encodeURIComponent(artifactId)}`);
        query.push('openBuddySheet=1');
      }
      openDetailPage(
        this,
        'draft-candidates-card',
        `packageEvent/pages/event-detail/index?${query.join('&')}`,
      );
    },
  },
});
