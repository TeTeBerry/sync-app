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

  const data = result.payload;
  const parts = [data?.name ?? '活动'];
  if (data?.date) parts.push(`时间：${data.date}`);
  if (data?.location) parts.push(`地点：${data.location}`);
  console.info('[ai-mode] getEvent 出口', data);
  return okResponse(
    `已获取活动详情：${parts.join('，')}。平台仅提供资讯，不售票。可点击卡片进入活动详情或分享。`,
    data,
  );
}

module.exports = { getEvent };
