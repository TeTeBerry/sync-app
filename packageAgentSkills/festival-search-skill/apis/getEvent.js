const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');

async function getEvent({ activityLegacyId }) {
  console.info('[ai-mode] getEvent 入口', { activityLegacyId });
  const result = await requestAgentCapability({
    path: `/agent-capabilities/events/${activityLegacyId}`,
    method: 'GET',
  });

  if (result.isError) {
    console.info('[ai-mode] getEvent 失败');
    return result;
  }

  const payload = result.payload;
  const event = {
    legacyId: payload?.legacyId ?? activityLegacyId,
    name: payload?.canonicalActivityName || payload?.name || '',
    date: payload?.date,
    location: payload?.location,
    heroImageUrl: payload?.heroImageUrl,
    latitude: payload?.latitude,
    longitude: payload?.longitude,
    lineupPublished: payload?.lineupPublished,
  };
  const data = {
    ...payload,
    canonicalActivityName: payload?.canonicalActivityName || payload?.name,
    events: [event],
    totalMatched: 1,
    activity: payload?.activity || {
      ...event,
      canonicalActivityName: payload?.canonicalActivityName || payload?.name || '',
    },
    uiDirectives: [
      {
        type: 'render-card',
        component: 'search-results-card',
        required: true,
        reason: 'getEvent 后必须渲染活动详情卡',
      },
    ],
  };
  const parts = [data?.name ?? '活动'];
  if (data?.date) parts.push(`时间：${data.date}`);
  if (data?.location) parts.push(`地点：${data.location}`);
  console.info('[ai-mode] getEvent 出口', data);
  return okResponse(
    `已获取活动详情：${parts.join('，')}。平台仅提供资讯，不售票。`,
    data,
  );
}

module.exports = { getEvent };
