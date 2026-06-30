const { setHomeCity } = require('../../shared/searchContext');

async function setSearchContext({ homeCity }) {
  console.info('[ai-mode] setSearchContext 入口', { homeCity });
  const saved = setHomeCity(homeCity);
  const text = saved
    ? `已记录出发城市：${saved}。后续检索将优先结合该出发地。`
    : '已清除出发城市偏好。';
  console.info('[ai-mode] setSearchContext 出口', { homeCity: saved });
  return {
    isError: false,
    content: [{ type: 'text', text }],
    structuredContent: { homeCity: saved || undefined },
  };
}

module.exports = { setSearchContext };
