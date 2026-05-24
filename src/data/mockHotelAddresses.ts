export interface HotelAddressSuggestion {
  id: string;
  title: string;
  address: string;
}

/** Mock：根据酒店名生成 AI 推荐地址 */
export function getMockHotelAddressSuggestions(hotelName: string): HotelAddressSuggestion[] {
  const name = hotelName.trim();
  if (name.length < 2) return [];

  return [
    {
      id: `official`,
      title: `${name} · 官方门店`,
      address: `上海市浦东新区世纪大道 1000 号 ${name}`,
    },
    {
      id: `venue`,
      title: `${name} · 近活动场馆`,
      address: `苏州市吴中区阳澄湖大道 88 号 ${name}（场馆 1.2km）`,
    },
    {
      id: `resort`,
      title: `${name} · 度假精选`,
      address: `三亚市海棠区海棠北路 168 号 ${name} 度假酒店`,
    },
  ];
}
