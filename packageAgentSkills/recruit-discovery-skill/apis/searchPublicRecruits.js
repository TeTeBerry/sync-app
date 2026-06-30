const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');

async function searchPublicRecruits({ activityLegacyId, query, prefs }) {
  console.info('[ai-mode] searchPublicRecruits 入口', { activityLegacyId, query });
  // activityLegacyId is optional — when omitted the backend auto-resolves
  // the activity from query via festival catalog search.
  const reqBody = { query, prefs };
  if (
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0
  ) {
    reqBody.activityLegacyId = activityLegacyId;
  }
  const result = await requestAgentCapability({
    path: '/agent-capabilities/search-public-recruits',
    method: 'POST',
    data: reqBody,
  });

  if (result.isError) {
    console.info('[ai-mode] searchPublicRecruits 失败');
    return result;
  }

  const data = {
    ...result.payload,
    activityLegacyId: result.payload?.activityLegacyId || activityLegacyId,
    canonicalActivityName:
      result.payload?.canonicalActivityName || result.payload?.activityName,
    activity: result.payload?.activity || {
      legacyId: result.payload?.activityLegacyId || activityLegacyId,
      name: result.payload?.canonicalActivityName || result.payload?.activityName || '',
      canonicalActivityName:
        result.payload?.canonicalActivityName || result.payload?.activityName || '',
    },
    uiDirectives: result.payload?.uiDirectives || [
      {
        type: 'render-card',
        component: 'recruit-list-card',
        required: true,
        reason: 'searchPublicRecruits 后必须渲染招募列表卡',
      },
    ],
  };
  const total = data?.totalMatched ?? 0;
  const labels = data?.filterLabels || [];
  const labelHint = labels.length ? `筛选：${labels.join(' · ')}。` : '';
  console.info('[ai-mode] searchPublicRecruits 出口', data);

  return okResponse(
    `${labelHint}已检索到 ${total} 条公开招募帖。平台不保证组满。接下来为用户展示招募列表卡片。`,
    data,
  );
}

module.exports = { searchPublicRecruits };
