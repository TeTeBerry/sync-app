export const SCENE_DURATION_S = 2.5;
export const FREEZE_DURATION_S = 1.5;
export const TOTAL_FILM_S = SCENE_DURATION_S * 4;
export const TOTAL_WITH_FREEZE_S = TOTAL_FILM_S + FREEZE_DURATION_S;

export type PlurSceneId = 'peace' | 'love' | 'unity' | 'respect';

export type PlurScene = {
  id: PlurSceneId;
  image: string;
  title: string;
  subtitle: string;
  accent: string;
  extra?: string;
};

export const PLUR_SCENE_DEFS: Array<Omit<PlurScene, 'image'>> = [
  {
    id: 'peace',
    title: 'Peace',
    subtitle: '放下争执，温柔共存',
    accent: '#4cc9f0',
  },
  {
    id: 'love',
    title: 'Love',
    subtitle: '释放温柔，善待每一个人',
    accent: '#f72585',
  },
  {
    id: 'unity',
    title: 'Unity',
    subtitle: '不分你我，万众一体',
    extra: 'We Are One',
    accent: '#7209b7',
  },
  {
    id: 'respect',
    title: 'Respect',
    subtitle: 'PEACE LOVE UNITY RESPECT',
    accent: '#f9c74f',
  },
];

export function buildPlurScenes(images: Record<PlurSceneId, string>): PlurScene[] {
  return PLUR_SCENE_DEFS.map((scene) => ({
    ...scene,
    image: images[scene.id],
  }));
}
