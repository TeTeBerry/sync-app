const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');
const { requestActivityUpdateSubscribe } = require('../../shared/wechatSubscribe');

function subscribeOutcomeText(outcome) {
  if (outcome === 'accepted') {
    return '已订阅阵容更新，阵容官宣或变更时将通过微信订阅消息提醒你。';
  }
  if (outcome === 'unconfigured') {
    return '已关注该活动阵容更新（站内）。微信通知模板未配置，请进入活动详情页完成订阅。';
  }
  if (outcome === 'rejected') {
    return '已关注该活动阵容更新（站内）。你刚才拒绝了微信通知，可进入活动详情页重新开启。';
  }
  if (outcome === 'needs_user_action') {
    return '已关注该活动阵容更新（站内）。微信通知需你在活动详情页亲手点「订阅」授权，请点击卡片进入。';
  }
  return '已订阅阵容更新提醒。';
}

async function subscribeLineupUpdates({ activityLegacyId }) {
  console.info('[ai-mode] subscribeLineupUpdates 入口', { activityLegacyId });
  const wechatOutcome = await requestActivityUpdateSubscribe();
  const notifyWechat = wechatOutcome === 'accepted';

  const result = await requestAgentCapability({
    path: '/agent-capabilities/subscribe-lineup-updates',
    method: 'POST',
    data: { activityLegacyId, notifyWechat },
  });

  if (result.isError) {
    console.info('[ai-mode] subscribeLineupUpdates 失败');
    return result;
  }

  const data = result.payload;
  console.info('[ai-mode] subscribeLineupUpdates 出口', data, wechatOutcome);
  return okResponse(subscribeOutcomeText(wechatOutcome), {
    ...data,
    activityLegacyId: data?.activityLegacyId ?? activityLegacyId,
    activityName: data?.activityName || '',
    wechatOutcome,
    notifyWechat,
    needsWechatAuth:
      wechatOutcome === 'needs_user_action' || wechatOutcome === 'rejected',
  });
}

module.exports = { subscribeLineupUpdates };
