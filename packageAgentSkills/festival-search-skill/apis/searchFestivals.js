const {
  requestAgentCapability,
  okResponse,
} = require('../../shared/callAgentCapability');
const { getStoredHomeCity } = require('../../shared/searchContext');

async function searchFestivals({ query, homeCity }) {
  const resolvedHomeCity = (homeCity || getStoredHomeCity() || '').trim();
  console.info('[ai-mode] searchFestivals 入口', { query, homeCity: resolvedHomeCity });
  const result = await requestAgentCapability({
    path: '/agent-capabilities/search-festivals',
    method: 'POST',
    data: { query, homeCity: resolvedHomeCity || undefined },
  });

  if (result.isError) {
    console.info('[ai-mode] searchFestivals 失败');
    return result;
  }

  const data = result.payload;
  const events = data?.events || [];
  const total = data?.totalMatched ?? events.length;
  const sole = events.length === 1 ? events[0] : null;
  let nameHint = '';
  if (sole?.name) {
    nameHint = `：${sole.name}`;
  } else if (events.length > 1 && events.length <= 3) {
    const names = events.map((e) => e.name).filter(Boolean);
    if (names.length) nameHint = `：${names.join('、')}`;
  }
  const cityHint = resolvedHomeCity ? `（出发地：${resolvedHomeCity}）` : '';
  console.info('[ai-mode] searchFestivals 出口', data);
  return okResponse(
    `已检索到 ${total} 场电音节${nameHint}${cityHint}。平台仅提供资讯，不售票。`,
    data,
  );
}

module.exports = { searchFestivals };
