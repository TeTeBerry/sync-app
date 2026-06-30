const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');

async function searchPublicRecruits({ activityLegacyId, query, prefs }) {
  console.info('[ai-mode] searchPublicRecruits 入口', { activityLegacyId, query });
  const result = await requestAgentCapability({
    path: '/agent-capabilities/search-public-recruits',
    method: 'POST',
    data: { activityLegacyId, query, prefs },
  });

  if (result.isError) {
    console.info('[ai-mode] searchPublicRecruits 失败');
    return result;
  }

  const data = result.payload;
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
