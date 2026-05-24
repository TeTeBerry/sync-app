export type Activity = {
  id: number;
  nameKey: string;
};

export const activities: Activity[] = [
  { id: 1, nameKey: `activities.tomorrowland` },
  { id: 2, nameKey: `activities.edc` },
  { id: 3, nameKey: `activities.s2o` },
  { id: 4, nameKey: `activities.ultra` },
];

export function getActivityById(id: number): Activity | undefined {
  return activities.find((activity) => activity.id === id);
}
