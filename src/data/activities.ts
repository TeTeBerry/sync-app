export type Activity = {
  id: number;
  nameKey: string;
  date: string;
  location: string;
  image: string;
  hot?: boolean;
};

export const activities: Activity[] = [
  {
    id: 1,
    nameKey: `activities.tomorrowland`,
    date: `12/11-13`,
    location: `芭提雅 Wisdom Valley`,
    image: `https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&q=80`,
    hot: true,
  },
  {
    id: 2,
    nameKey: `activities.edc`,
    date: `03/22-23`,
    location: `苏州阳澄湖半岛旅游度假区`,
    image: `https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg`,
  },
  {
    id: 4,
    nameKey: `activities.storm`,
    date: `06/13-14`,
    location: `深圳国际会展中心`,
    image: `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80`,
    hot: true,
  },
  {
    id: 5,
    nameKey: `activities.edcThailand`,
    date: `12/18-20`,
    location: `普吉岛 Rhythm Park`,
    image: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80`,
  },
  {
    id: 6,
    nameKey: `activities.vac`,
    date: `04/18-19`,
    location: `横琴长隆度假区`,
    image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80`,
  },
];

export function getActivityById(id: number): Activity | undefined {
  return activities.find((activity) => activity.id === id);
}
