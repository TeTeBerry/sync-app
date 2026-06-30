const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');
const { getStoredHomeCity } = require('../../shared/searchContext');

function parseHeadcount(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.floor(raw);
  }
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveDeparture(formData) {
  const fromForm = String(formData?.departure || formData?.departureCity || '').trim();
  return fromForm;
}

function buildMissingFormMessage(missing, activityLegacyId) {
  const storedCity = getStoredHomeCity();
  const parts = [];
  if (missing.includes('departure')) {
    if (storedCity) {
      parts.push(`请确认是否从${storedCity}出发（或告诉我其它出发城市）`);
    } else {
      parts.push('请告诉我从哪个城市出发');
    }
  }
  if (missing.includes('headcount')) {
    parts.push('几人出行');
  }
  const ask = parts.join('，') + '，我再为你生成出行攻略。';
  return {
    isError: true,
    content: [{ type: 'text', text: ask }],
    structuredContent: {
      _error: true,
      message: ask,
      activityLegacyId,
      missingFields: missing,
    },
  };
}

async function generateTravelGuide({ activityLegacyId, formData }) {
  const departure = resolveDeparture(formData);
  const headcount = parseHeadcount(formData?.headcount);
  const missing = [];
  if (!departure) missing.push('departure');
  if (headcount < 1) missing.push('headcount');

  console.info('[ai-mode] generateTravelGuide 入口', {
    activityLegacyId,
    departure,
    headcount,
    missing,
  });

  if (missing.length) {
    console.info('[ai-mode] generateTravelGuide 缺表单项', missing);
    return buildMissingFormMessage(missing, activityLegacyId);
  }

  const result = await requestAgentCapability({
    path: '/agent-capabilities/generate-travel-guide',
    method: 'POST',
    data: {
      activityLegacyId,
      formData: {
        ...formData,
        departure,
        departureCity:
          typeof formData?.departureCity === 'string' && formData.departureCity.trim()
            ? formData.departureCity.trim()
            : departure,
        headcount,
      },
    },
  });

  if (result.isError) {
    console.info('[ai-mode] generateTravelGuide 失败');
    return result;
  }

  const data = result.payload;
  console.info('[ai-mode] generateTravelGuide 出口', data);
  return okResponse(
    `已为「${departure}」出发、${headcount} 人创建出行攻略任务${data?.activityName ? `（${data.activityName}）` : ''}（${data?.status ?? 'pending'}）。点击卡片进入小程序查看进度，AI 内容仅供参考。`,
    {
      ...data,
      activityLegacyId: data?.activityLegacyId ?? activityLegacyId,
      activityName: data?.activityName || '',
      departure,
      headcount,
    },
  );
}

module.exports = { generateTravelGuide };
