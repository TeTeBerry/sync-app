import type { ExclusiveItineraryDj } from '@/packageEvent/pages/exclusive-itinerary/types';
import type { ItineraryDay } from '@/domains/performance-itinerary/types/myItineraryUi';

export const FIXTURE_EXCLUSIVE_DJS: ExclusiveItineraryDj[] = [
  {
    id: 'marshmello',
    name: 'MARSHMELLO',
    genre: 'Future Bass',
    genreLabel: 'Future Bass · Melodic Trap · Future House · Electro Pop',
    stage: 'main',
    popularity: 98,
    avatarSeed: 'marshmello',
    genreColor: '#ff2d55',
  },
  {
    id: 'excision',
    name: 'EXCISION',
    genre: 'Dubstep',
    genreLabel: 'Brostep',
    stage: 'main',
    popularity: 95,
    avatarSeed: 'excision',
    genreColor: '#f97316',
  },
  {
    id: 'odd-mob',
    name: 'ODD MOB',
    genre: 'House',
    genreLabel: 'Tech House · Bass House',
    stage: 'main',
    popularity: 89,
    avatarSeed: 'odd-mob',
    genreColor: '#3b82f6',
  },
];

export const FIXTURE_CONFLICT_SLOTS = [
  {
    artistId: 'excision',
    artistName: 'EXCISION',
    dateKey: 'jun13',
    startMinutes: 19 * 60 + 10,
    endMinutes: 20 * 60 + 25,
    startTime: '19:10',
    endTime: '20:25',
    stageLabel: '主舞台',
  },
  {
    artistId: 'marshmello',
    artistName: 'MARSHMELLO',
    dateKey: 'jun13',
    startMinutes: 20 * 60 + 30,
    endMinutes: 22 * 60,
    startTime: '20:30',
    endTime: '22:00',
    stageLabel: '主舞台',
  },
];

export const FIXTURE_ITINERARY_DAYS: ItineraryDay[] = [
  {
    id: 'jun13',
    label: '6月13日',
    bannerDateLabel: '6月13日',
    nodeCount: 2,
    items: [
      {
        id: 'excision',
        time: '19:00',
        dotColor: 'cyan',
        title: 'EXCISION · 主舞台',
        subtitle: 'Brostep 专场',
        timeTag: '19:00-20:15',
        timeTagColor: 'cyan',
      },
      {
        id: 'marshmello',
        time: '20:30',
        dotColor: 'pink',
        title: 'MARSHMELLO · 主舞台',
        subtitle: '6月13日头条',
        timeTag: '20:30-22:00',
        timeTagColor: 'pink',
        pill: { label: '重点演出 · 必看', variant: 'pink' },
        highlighted: true,
      },
    ],
  },
  {
    id: 'jun14',
    label: '6月14日',
    bannerDateLabel: '6月14日',
    nodeCount: 2,
    items: [
      {
        id: 'eric-prydz',
        time: '18:55',
        dotColor: 'cyan',
        title: 'ERIC PRYDZ · 主舞台',
        subtitle: 'Progressive House · Electro',
        timeTag: '18:55-20:25',
        timeTagColor: 'cyan',
      },
      {
        id: 'illenium',
        time: '20:30',
        dotColor: 'purple',
        title: 'ILLENIUM · 主舞台',
        subtitle: 'Melodic Dubstep',
        timeTag: '20:30-22:00',
        timeTagColor: 'purple',
        pill: { label: '重点演出 · 必看', variant: 'pink' },
        highlighted: true,
      },
    ],
  },
];
