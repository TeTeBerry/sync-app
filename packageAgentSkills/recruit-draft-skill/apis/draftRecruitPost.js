const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');

async function draftRecruitPost({ activityLegacyId, draft }) {
  console.info('[ai-mode] draftRecruitPost 入口', { activityLegacyId, draft });
  const result = await requestAgentCapability({
    path: '/agent-capabilities/draft-recruit-post',
    method: 'POST',
    data: { activityLegacyId, draft },
  });

  if (result.isError) {
    console.info('[ai-mode] draftRecruitPost 失败');
    return result;
  }

  const data = result.payload;
  const count = data?.preview?.candidates?.length ?? 0;
  console.info('[ai-mode] draftRecruitPost 出口', data);

  return okResponse(
    `已生成 ${count} 条招募帖草稿。请进入小程序确认后发布；平台不代发帖。`,
    { ...data, formData: data?.formData || {} },
  );
}

module.exports = { draftRecruitPost };
