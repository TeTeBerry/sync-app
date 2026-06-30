const {
  attachAiModeComponent,
  openDetailPage,
  sendTextFollowUp,
  preloadRelatedDetailPage,
} = require('../../../shared/componentModelContext');

function formatSubscribedAt(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function wechatHintForOutcome(outcome, needsWechatAuth) {
  if (outcome === 'accepted') {
    return '阵容有更新时，微信订阅消息将推送提醒你。';
  }
  if (needsWechatAuth || outcome === 'needs_user_action') {
    return '点击本卡片进入活动详情，在页面顶部点「订阅」并完成微信授权。';
  }
  if (outcome === 'rejected') {
    return '你拒绝了通知授权，可在活动详情页重新订阅。';
  }
  if (outcome === 'unconfigured') {
    return '微信通知模板未配置，请进入活动详情页手动订阅。';
  }
  return '';
}

function statusChipClassFor(tone) {
  if (tone === 'prep-status-card--success') return 'card-status-chip--success';
  if (tone === 'prep-status-card--error') return 'card-status-chip--error';
  return 'card-status-chip--pending';
}

function ctaLabelFor(jobId) {
  return jobId ? '查看攻略' : '进入详情';
}

Component({
  data: {
    activityName: '',
    statusLabel: '准备中',
    detailText: '',
    wechatHint: '',
    statusTone: '',
    statusChipClass: 'card-status-chip--pending',
    ctaLabel: '进入详情',
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'prep-status-card', function applyPrep(sc) {
        if (sc._error) {
          this._activityLegacyId = sc.activityLegacyId || 0;
          this._jobId = '';
          const isMissingForm =
            Array.isArray(sc.missingFields) && sc.missingFields.length > 0;
          const statusTone = isMissingForm
            ? 'prep-status-card--pending'
            : 'prep-status-card--error';
          this.setData({
            statusTone,
            statusChipClass: statusChipClassFor(statusTone),
            statusLabel: isMissingForm ? '待补充出行信息' : '操作失败',
            detailText: sc.message || '请先登录后重试',
            wechatHint: isMissingForm
              ? '请直接在对话里回复出发城市与人数，不要点击卡片代替填写。'
              : '',
            ctaLabel: isMissingForm ? '稍后填写' : '重试',
            activityName: '',
          });
          console.info('[ai-mode] prep-status-card error', sc.message);
          return;
        }

        if (sc.jobId) {
          const status = sc.status || 'pending';
          const statusLabel =
            status === 'pending' || status === 'running'
              ? '攻略生成中'
              : '攻略任务已创建';
          const activityLegacyId = sc.activityLegacyId || 0;
          const statusTone =
            status === 'pending' || status === 'running'
              ? 'prep-status-card--pending'
              : 'prep-status-card--success';
          this._jobId = sc.jobId;
          this._activityLegacyId = activityLegacyId;
          const detailText =
            sc.departure && sc.headcount
              ? `从 ${sc.departure} 出发 · ${sc.headcount} 人 · 攻略生成中`
              : '攻略正在生成，可实时查看进度';
          this.setData({
            statusTone,
            statusChipClass: statusChipClassFor(statusTone),
            statusLabel,
            detailText,
            wechatHint: '',
            ctaLabel: ctaLabelFor(sc.jobId),
            activityName: sc.activityName || '',
          });
          console.info('[ai-mode] prep-status-card setData travel-guide');

          if (activityLegacyId) {
            const guideUrl = `packageEvent/pages/ai-travel-guide/index?legacyId=${activityLegacyId}&guideJobId=${encodeURIComponent(sc.jobId)}`;
            const viewCtx = wx.modelContext.getViewContext(this);
            viewCtx.setRelatedPage({
              path: '/packageEvent/pages/ai-travel-guide/index',
              query: `legacyId=${activityLegacyId}&guideJobId=${encodeURIComponent(sc.jobId)}`,
            });
            preloadRelatedDetailPage(this, 'prep-status-card', guideUrl);
          }
          return;
        }

        if (sc.goalId) {
          const activityLegacyId = sc.activityLegacyId || 0;
          this._jobId = '';
          this._activityLegacyId = activityLegacyId;
          const needsWechatAuth = !!sc.needsWechatAuth;
          const wechatHint = wechatHintForOutcome(sc.wechatOutcome, needsWechatAuth);
          const subscribedLabel = formatSubscribedAt(sc.subscribedAt);
          const statusTone = sc.notifyWechat
            ? 'prep-status-card--success'
            : 'prep-status-card--pending';
          this.setData({
            statusTone,
            statusChipClass: statusChipClassFor(statusTone),
            statusLabel: sc.notifyWechat
              ? '已订阅阵容更新'
              : needsWechatAuth
                ? '待微信授权'
                : '已关注阵容更新',
            detailText: subscribedLabel
              ? `关注时间：${subscribedLabel}`
              : '阵容官宣或变更时将通知你',
            wechatHint,
            ctaLabel: '进入活动',
            activityName: sc.activityName || '',
          });
          console.info('[ai-mode] prep-status-card setData subscribe');

          if (activityLegacyId) {
            const detailUrl = `packageEvent/pages/event-detail/index?legacyId=${activityLegacyId}`;
            const viewCtx = wx.modelContext.getViewContext(this);
            viewCtx.setRelatedPage({
              path: '/packageEvent/pages/event-detail/index',
              query: `legacyId=${activityLegacyId}`,
            });
            preloadRelatedDetailPage(this, 'prep-status-card', detailUrl);
          }
        }
      });
    },
  },

  methods: {
    onTap() {
      const legacyId = this._activityLegacyId;
      const jobId = this._jobId;
      if (jobId && legacyId) {
        openDetailPage(
          this,
          'prep-status-card',
          `packageEvent/pages/ai-travel-guide/index?legacyId=${legacyId}&guideJobId=${encodeURIComponent(jobId)}`,
        );
        return;
      }
      if (legacyId) {
        openDetailPage(
          this,
          'prep-status-card',
          `packageEvent/pages/event-detail/index?legacyId=${legacyId}`,
        );
        return;
      }
      sendTextFollowUp(this, 'prep-status-card', '打开首页查看观演准备');
    },
  },
});
