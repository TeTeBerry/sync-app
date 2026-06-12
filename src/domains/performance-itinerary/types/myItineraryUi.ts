export type ItineraryTimelineDotColor = 'pink' | 'cyan' | 'purple';

export type ItineraryTimelinePill = {
  label: string;
  variant: 'green' | 'pink';
};

export type ItineraryTimelineItem = {
  id: string;
  time: string;
  dotColor: ItineraryTimelineDotColor;
  title: string;
  subtitle?: string;
  timeTag?: string;
  timeTagColor?: ItineraryTimelineDotColor;
  pill?: ItineraryTimelinePill;
  highlighted?: boolean;
};

export type ItineraryDay = {
  id: string;
  label: string;
  bannerDateLabel: string;
  nodeCount: number;
  items: ItineraryTimelineItem[];
};
