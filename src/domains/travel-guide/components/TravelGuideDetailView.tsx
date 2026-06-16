import type { ReactNode } from 'react';
import type { TravelGuidePlan } from '@/types/travelGuide';
import {
  findTravelGuideTotalBudgetItem,
  shortTravelGuideBudgetLabel,
  travelGuideBudgetPerPersonRange,
} from '@/domains/travel-guide/utils/travelGuideBudgetDisplay.util';
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
import './TravelGuideDetailView.scss';

type TravelGuideDetailViewProps = {
  plan: TravelGuidePlan;
};

type SectionAccent =
  | 'default'
  | 'docs'
  | 'ticket'
  | 'transport'
  | 'venue'
  | 'hotel'
  | 'budget'
  | 'essentials'
  | 'nightlife'
  | 'tips';

const SECTION_ICON_COLORS: Record<SectionAccent, string> = {
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
};

function SectionIcon({ accent }: { accent: SectionAccent }) {
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
    default:
      return <Sparkles {...props} />;
  }
}

function SectionCard({
  title,
  children,
  accent = 'default',
}: {
  title: string;
  children: ReactNode;
  accent?: SectionAccent;
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

function BulletList({ items }: { items: string[] }) {
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

export function TravelGuideDetailView({ plan }: TravelGuideDetailViewProps) {
  const totalBudget = findTravelGuideTotalBudgetItem(plan);
  const perPersonBudget =
    totalBudget != null
      ? travelGuideBudgetPerPersonRange(totalBudget.range, plan.headcount)
      : null;
  const accommodationSchemes = plan.accommodation.schemes ?? [];
  const featuredHotelNames = new Set(accommodationSchemes.map((s) => s.name));
  const moreHotels = plan.accommodation.hotels.filter(
    (hotel) => !featuredHotelNames.has(hotel.name),
  );

  return (
    <View className="s-travel-guide-detail">
      <View className="s-travel-guide-detail__hero">
        <View className="s-travel-guide-detail__hero-top">
          <View className="s-travel-guide-detail__hero-badge" aria-hidden>
            <Sparkles size={14} color="#ff69b4" />
          </View>
          <Text className="s-travel-guide-detail__hero-kicker">AI 出行攻略</Text>
        </View>

        <Text className="s-travel-guide-detail__hero-title">{plan.activityName}</Text>

        <Text className="s-travel-guide-detail__hero-meta">
          {plan.eventDates} · {plan.venue}
        </Text>

        <View className="s-travel-guide-detail__chips">
          <Text className="s-travel-guide-detail__chip">{plan.departure}</Text>
          <Text className="s-travel-guide-detail__chip">{plan.headcount}人</Text>
          <Text className="s-travel-guide-detail__chip">
            住{plan.accommodationNights}晚
          </Text>
          <Text className="s-travel-guide-detail__chip">
            {shortTravelGuideBudgetLabel(plan.budgetLabel)}
          </Text>
          <Text className="s-travel-guide-detail__chip">
            {plan.selfDrive ? '自驾' : '公共交通'}
          </Text>
        </View>

        {totalBudget ? (
          <View className="s-travel-guide-detail__budget-banner">
            <Text className="s-travel-guide-detail__budget-label">全程预算 · 合计</Text>
            <Text className="s-travel-guide-detail__budget-value">
              {totalBudget.range}
            </Text>
            {perPersonBudget ? (
              <Text className="s-travel-guide-detail__budget-sub">
                人均 {perPersonBudget}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {plan.documents?.items.length ? (
        <SectionCard title={plan.documents.title} accent="docs">
          <BulletList items={plan.documents.items} />
        </SectionCard>
      ) : null}

      {plan.tickets?.channels.length ? (
        <SectionCard title={plan.tickets.title} accent="ticket">
          {plan.tickets.channels.map((channel) => (
            <View key={channel.name} className="s-travel-guide-detail__named-item">
              <Text className="s-travel-guide-detail__named-item-title">
                {channel.name}
              </Text>
              <Text className="s-travel-guide-detail__named-item-note">
                {channel.note}
              </Text>
            </View>
          ))}
        </SectionCard>
      ) : null}

      <SectionCard title={plan.transport.title} accent="transport">
        <BulletList items={plan.transport.lines} />
      </SectionCard>

      {plan.venueTransport?.options.length ? (
        <SectionCard title={plan.venueTransport.title} accent="venue">
          {plan.venueTransport.options.map((option) => (
            <View key={option.label} className="s-travel-guide-detail__option-block">
              <Text className="s-travel-guide-detail__option-label">
                {option.label}
              </Text>
              <BulletList items={option.lines} />
            </View>
          ))}
        </SectionCard>
      ) : null}

      <SectionCard title={plan.accommodation.title} accent="hotel">
        <View className="s-travel-guide-detail__scheme-grid">
          {accommodationSchemes.map((scheme) => (
            <View key={scheme.label} className="s-travel-guide-detail__scheme">
              <Text className="s-travel-guide-detail__scheme-label">
                {scheme.label}
              </Text>
              <Text className="s-travel-guide-detail__scheme-name">{scheme.name}</Text>
              <Text className="s-travel-guide-detail__scheme-note">{scheme.note}</Text>
              <Text className="s-travel-guide-detail__scheme-reason">
                {scheme.reason}
              </Text>
              {scheme.bookingHint ? (
                <Text className="s-travel-guide-detail__scheme-hint">
                  预订 {scheme.bookingHint}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
        {moreHotels.length ? (
          <View className="s-travel-guide-detail__more-list">
            <Text className="s-travel-guide-detail__subsection-title">更多备选</Text>
            {moreHotels.map((hotel) => (
              <View key={hotel.name} className="s-travel-guide-detail__named-item">
                <Text className="s-travel-guide-detail__named-item-title">
                  {hotel.name}
                </Text>
                <Text className="s-travel-guide-detail__named-item-note">
                  {hotel.note}
                </Text>
                {hotel.reason ? (
                  <Text className="s-travel-guide-detail__named-item-reason">
                    {hotel.reason}
                  </Text>
                ) : null}
                {hotel.bookingHint ? (
                  <Text className="s-travel-guide-detail__named-item-hint">
                    预订 {hotel.bookingHint}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
        {!accommodationSchemes.length
          ? plan.accommodation.hotels.map((hotel) => (
              <View key={hotel.name} className="s-travel-guide-detail__named-item">
                <Text className="s-travel-guide-detail__named-item-title">
                  {hotel.name}
                </Text>
                <Text className="s-travel-guide-detail__named-item-note">
                  {hotel.note}
                </Text>
                {hotel.reason ? (
                  <Text className="s-travel-guide-detail__named-item-reason">
                    {hotel.reason}
                  </Text>
                ) : null}
              </View>
            ))
          : null}
      </SectionCard>

      {plan.budget?.items.length ? (
        <SectionCard title={plan.budget.title} accent="budget">
          <View className="s-travel-guide-detail__budget-table">
            {plan.budget.items.map((item) => {
              const isTotal = item.label.includes('合计');
              return (
                <View
                  key={item.label}
                  className={
                    isTotal
                      ? 's-travel-guide-detail__budget-row s-travel-guide-detail__budget-row--total'
                      : 's-travel-guide-detail__budget-row'
                  }
                >
                  <View className="s-travel-guide-detail__budget-row-main">
                    <Text className="s-travel-guide-detail__budget-row-label">
                      {item.label}
                    </Text>
                    <Text className="s-travel-guide-detail__budget-row-value">
                      {item.range}
                    </Text>
                  </View>
                  {item.note ? (
                    <Text className="s-travel-guide-detail__budget-row-note">
                      {item.note}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </SectionCard>
      ) : null}

      {plan.parking?.lines.length ? (
        <SectionCard title={plan.parking.title} accent="venue">
          <BulletList items={plan.parking.lines} />
        </SectionCard>
      ) : null}

      {plan.essentials ? (
        <SectionCard title={plan.essentials.title} accent="essentials">
          <Text className="s-travel-guide-detail__essentials-group">网络</Text>
          <BulletList items={plan.essentials.network} />
          <Text className="s-travel-guide-detail__essentials-group">支付</Text>
          <BulletList items={plan.essentials.payment} />
          <Text className="s-travel-guide-detail__essentials-group">必备 App</Text>
          <BulletList items={plan.essentials.apps} />
        </SectionCard>
      ) : null}

      <SectionCard title={plan.nightlife.title} accent="nightlife">
        {plan.nightlife.spots.map((spot) => (
          <View key={spot.name} className="s-travel-guide-detail__named-item">
            <Text className="s-travel-guide-detail__named-item-title">{spot.name}</Text>
            <Text className="s-travel-guide-detail__named-item-note">{spot.note}</Text>
            {spot.reason ? (
              <Text className="s-travel-guide-detail__named-item-reason">
                {spot.reason}
              </Text>
            ) : null}
          </View>
        ))}
      </SectionCard>

      <SectionCard title={plan.tips.title} accent="tips">
        <BulletList items={plan.tips.items} />
      </SectionCard>
    </View>
  );
}
