const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');

async function getLineup({ activityLegacyId }) {
  console.info('[ai-mode] getLineup 入口', { activityLegacyId });
  const result = await requestAgentCapability({
    path: `/agent-capabilities/events/${activityLegacyId}/lineup`,
    method: 'GET',
  });

  if (result.isError) {
    console.info('[ai-mode] getLineup 失败');
    return result;
  }

  const data = {
    ...result.payload,
    canonicalActivityName:
      result.payload?.canonicalActivityName || result.payload?.activityName,
    activity: result.payload?.activity || {
      legacyId: result.payload?.activityLegacyId || activityLegacyId,
      name: result.payload?.canonicalActivityName || result.payload?.activityName || '',
      canonicalActivityName:
        result.payload?.canonicalActivityName || result.payload?.activityName || '',
      date: result.payload?.activityDate,
      location: result.payload?.activityLocation,
    },
    uiDirectives: result.payload?.uiDirectives || [
      {
        type: 'render-card',
        component: 'artist-lineup-strip',
        required: true,
        reason: 'getLineup 后必须渲染阵容横滑卡',
      },
    ],
  };
  const count = data?.artists?.length ?? 0;
  const activityLabel = data?.activityName ? `（${data.activityName}）` : '';
  console.info('[ai-mode] getLineup 出口', data);
  return okResponse(
    `已获取阵容信息${activityLabel}，共 ${count} 位艺人。可横滑查看艺人列表。`,
    data,
  );
}

module.exports = { getLineup };
