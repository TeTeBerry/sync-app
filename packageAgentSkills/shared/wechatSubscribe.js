/**
 * WeChat subscribe-message consent for skill atomic APIs.
 * Note: requestSubscribeMessage requires a user tap in most contexts;
 * agent-triggered API calls usually get needs_user_action → authorize on event detail.
 */

function loadBuildConfig() {
  try {
    return require('./wechatAiBuildConfig.js');
  } catch {
    try {
      return require('./wechatAiBuildConfig.json');
    } catch {
      return { activityUpdateSubscribeTemplateId: '' };
    }
  }
}

function requestSubscribeMessage(tmplIds) {
  const uniqueIds = [...new Set(tmplIds.filter(Boolean))];
  if (!uniqueIds.length) {
    return Promise.resolve({ result: undefined, errMsg: 'empty tmplIds' });
  }

  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: uniqueIds,
      success(res) {
        resolve({ result: res, errMsg: '' });
      },
      fail(err) {
        resolve({
          result: undefined,
          errMsg: err?.errMsg || 'requestSubscribeMessage:fail',
        });
      },
    });
  });
}

/**
 * @returns {'accepted'|'rejected'|'unconfigured'|'needs_user_action'}
 */
async function requestActivityUpdateSubscribe() {
  const templateId = loadBuildConfig().activityUpdateSubscribeTemplateId?.trim() || '';
  if (!templateId) return 'unconfigured';

  const { result, errMsg } = await requestSubscribeMessage([templateId]);
  console.info('[ai-mode] requestSubscribeMessage', {
    templateId,
    result,
    errMsg,
  });

  const status = result?.[templateId];
  if (status === 'accept') return 'accepted';
  if (status === 'reject' || status === 'ban' || status === 'filter') {
    return 'rejected';
  }

  // API fail / no dialog (common when agent calls without user tap gesture)
  return 'needs_user_action';
}

module.exports = {
  requestActivityUpdateSubscribe,
};
