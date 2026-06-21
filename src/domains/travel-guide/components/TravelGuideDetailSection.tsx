import type { ReactNode } from 'react';
import {
  BedDouble,
  Car,
  FileText,
  Plane,
  Sparkles,
  Ticket,
  TrendingUp,
  Utensils,
  Zap,
} from '@/components/icons';
import { Text, View } from '@tarojs/components';

export type TravelGuideSectionAccent =
  | 'default'
  | 'docs'
  | 'ticket'
  | 'transport'
  | 'venue'
  | 'hotel'
  | 'budget'
  | 'essentials'
  | 'nightlife'
  | 'tips'
  | 'itinerary';

const SECTION_ICON_COLORS: Record<TravelGuideSectionAccent, string> = {
  default: '#ff69b4',
  docs: '#f2f2f7',
  ticket: '#f2f2f7',
  transport: '#64d2ff',
  venue: '#64d2ff',
  hotel: '#ff69b4',
  budget: '#ffd60a',
  essentials: '#f2f2f7',
  nightlife: '#f2f2f7',
  tips: '#ff69b4',
  itinerary: '#64d2ff',
};

function SectionIcon({ accent }: { accent: TravelGuideSectionAccent }) {
  const color = SECTION_ICON_COLORS[accent];
  const props = { size: 14, color };
  switch (accent) {
    case 'docs':
      return <FileText {...props} />;
    case 'ticket':
      return <Ticket {...props} />;
    case 'transport':
      return <Plane {...props} />;
    case 'venue':
      return <Car {...props} />;
    case 'hotel':
      return <BedDouble {...props} />;
    case 'budget':
      return <TrendingUp {...props} />;
    case 'essentials':
      return <Zap {...props} />;
    case 'nightlife':
      return <Utensils {...props} />;
    case 'tips':
      return <Sparkles {...props} />;
    case 'itinerary':
      return <Plane {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

export function TravelGuideDetailSection({
  title,
  children,
  accent = 'default',
}: {
  title: string;
  children: ReactNode;
  accent?: TravelGuideSectionAccent;
}) {
  return (
    <View
      className={`s-travel-guide-detail__section s-travel-guide-detail__section--${accent}`}
    >
      <View className="s-travel-guide-detail__section-head">
        <View className="s-travel-guide-detail__section-icon" aria-hidden>
          <SectionIcon accent={accent} />
        </View>
        <Text className="s-travel-guide-detail__section-title">{title}</Text>
      </View>
      <View className="s-travel-guide-detail__section-body">{children}</View>
    </View>
  );
}

export function TravelGuideDetailBulletList({ items }: { items: string[] }) {
  return (
    <View className="s-travel-guide-detail__list">
      {items.map((item, index) => (
        <View
          key={`${index}-${item.slice(0, 12)}`}
          className="s-travel-guide-detail__bullet-row"
        >
          <View className="s-travel-guide-detail__bullet-dot" aria-hidden />
          <Text className="s-travel-guide-detail__bullet">{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function TravelGuideDetailNamedItem({
  title,
  note,
  reason,
  bookingHint,
}: {
  title: string;
  note: string;
  reason?: string;
  bookingHint?: string;
}) {
  return (
    <View className="s-travel-guide-detail__named-item">
      <Text className="s-travel-guide-detail__named-item-title">{title}</Text>
      <Text className="s-travel-guide-detail__named-item-note">{note}</Text>
      {reason ? (
        <Text className="s-travel-guide-detail__named-item-reason">{reason}</Text>
      ) : null}
      {bookingHint ? (
        <Text className="s-travel-guide-detail__named-item-hint">
          预订 {bookingHint}
        </Text>
      ) : null}
    </View>
  );
}
