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
    image: `https://images.unsplash.com/photo-1470229722913-7c090be5c520?w=200&q=80`,
  },
  {
    id: 3,
    nameKey: `activities.s2o`,
    date: `06/28-29`,
    location: `三亚海棠湾`,
    image: `https://images.unsplash.com/photo-1540039155732-d674d4e3f421?w=200&q=80`,
  },
  {
    id: 4,
    nameKey: `activities.ultra`,
    date: `08/01-03`,
    location: `上海世博公园`,
    image: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80`,
  },
];

export function getActivityById(id: number): Activity | undefined {
  return activities.find((activity) => activity.id === id);
}
