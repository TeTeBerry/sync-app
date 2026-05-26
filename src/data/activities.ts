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
    date: `06/18-19`,
    location: `CLUB SPACE · 上海`,
    image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80`,
    hot: true,
  },
  {
    id: 2,
    nameKey: `activities.edc`,
    date: `07/12-13`,
    location: `苏州阳澄湖`,
    image: `https://image.electricdaisycarnival.cn/sites/7/2024/12/edccn_2025_mk_an_fest_site_mh_1534x1360_r01.jpg`,
  },
  {
    id: 4,
    nameKey: `activities.ultra`,
    date: `08/01-03`,
    location: `成都`,
    image: `https://xqimg.imedao.com/195407c76ec3d53a3fe41eda.jpeg`,
  },
];

export function getActivityById(id: number): Activity | undefined {
  return activities.find((activity) => activity.id === id);
}
