import type { ReactNode } from 'react';
import type { TravelGuidePlan } from '@/types/travelGuide';
import { Text, View } from '@tarojs/components';
import './TravelGuideDetailView.scss';

type TravelGuideDetailViewProps = {
  plan: TravelGuidePlan;
};

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="s-travel-guide-detail__section">
      <Text className="s-travel-guide-detail__section-title">{title}</Text>
      <View className="s-travel-guide-detail__section-body">{children}</View>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View className="s-travel-guide-detail__list">
      {items.map((item, index) => (
        <Text
          key={`${index}-${item.slice(0, 12)}`}
          className="s-travel-guide-detail__bullet"
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

export function TravelGuideDetailView({ plan }: TravelGuideDetailViewProps) {
  const totalBudget = plan.budget?.items.find((item) => item.label.includes('合计'));

  return (
    <View className="s-travel-guide-detail">
      <View className="s-travel-guide-detail__hero">
        <Text className="s-travel-guide-detail__hero-kicker">AI 出行攻略</Text>
        <Text className="s-travel-guide-detail__hero-title">{plan.activityName}</Text>
        <View className="s-travel-guide-detail__hero-meta">
          <Text className="s-travel-guide-detail__hero-meta-line">
            📅 {plan.eventDates}
          </Text>
          <Text className="s-travel-guide-detail__hero-meta-line">📍 {plan.venue}</Text>
        </View>
        <View className="s-travel-guide-detail__chips">
          <Text className="s-travel-guide-detail__chip">{plan.departure}出发</Text>
          <Text className="s-travel-guide-detail__chip">{plan.headcount}人</Text>
          <Text className="s-travel-guide-detail__chip">
            住{plan.accommodationNights}晚
          </Text>
          <Text className="s-travel-guide-detail__chip">{plan.budgetLabel}</Text>
          <Text className="s-travel-guide-detail__chip">
            {plan.selfDrive ? '自驾' : '公共交通'}
          </Text>
        </View>
        {totalBudget ? (
          <View className="s-travel-guide-detail__budget-banner">
            <Text className="s-travel-guide-detail__budget-label">全程预算参考</Text>
            <Text className="s-travel-guide-detail__budget-value">
              {totalBudget.range}
            </Text>
          </View>
        ) : null}
      </View>

      {plan.documents?.items.length ? (
        <SectionCard title={plan.documents.title}>
          <BulletList items={plan.documents.items} />
        </SectionCard>
      ) : null}

      {plan.tickets?.channels.length ? (
        <SectionCard title={plan.tickets.title}>
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

      <SectionCard title={plan.transport.title}>
        <BulletList items={plan.transport.lines} />
      </SectionCard>

      {plan.venueTransport?.options.length ? (
        <SectionCard title={plan.venueTransport.title}>
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

      <SectionCard title={plan.accommodation.title}>
        {(plan.accommodation.schemes ?? []).map((scheme) => (
          <View key={scheme.label} className="s-travel-guide-detail__scheme">
            <Text className="s-travel-guide-detail__scheme-label">{scheme.label}</Text>
            <Text className="s-travel-guide-detail__scheme-name">{scheme.name}</Text>
            <Text className="s-travel-guide-detail__scheme-note">{scheme.note}</Text>
            <Text className="s-travel-guide-detail__scheme-reason">
              推荐理由：{scheme.reason}
            </Text>
            {scheme.bookingHint ? (
              <Text className="s-travel-guide-detail__scheme-hint">
                预订：{scheme.bookingHint}
              </Text>
            ) : null}
          </View>
        ))}
        {!plan.accommodation.schemes?.length
          ? plan.accommodation.hotels.map((hotel) => (
              <View key={hotel.name} className="s-travel-guide-detail__named-item">
                <Text className="s-travel-guide-detail__named-item-title">
                  {hotel.name}
                </Text>
                <Text className="s-travel-guide-detail__named-item-note">
                  {hotel.note}
                </Text>
              </View>
            ))
          : null}
      </SectionCard>

      {plan.budget?.items.length ? (
        <SectionCard title={plan.budget.title}>
          {plan.budget.items.map((item) => (
            <View key={item.label} className="s-travel-guide-detail__budget-row">
              <Text className="s-travel-guide-detail__budget-row-label">
                {item.label}
              </Text>
              <Text className="s-travel-guide-detail__budget-row-value">
                {item.range}
              </Text>
              {item.note ? (
                <Text className="s-travel-guide-detail__budget-row-note">
                  {item.note}
                </Text>
              ) : null}
            </View>
          ))}
        </SectionCard>
      ) : null}

      {plan.parking?.lines.length ? (
        <SectionCard title={plan.parking.title}>
          <BulletList items={plan.parking.lines} />
        </SectionCard>
      ) : null}

      {plan.essentials ? (
        <SectionCard title={plan.essentials.title}>
          <Text className="s-travel-guide-detail__essentials-group">网络</Text>
          <BulletList items={plan.essentials.network} />
          <Text className="s-travel-guide-detail__essentials-group">支付</Text>
          <BulletList items={plan.essentials.payment} />
          <Text className="s-travel-guide-detail__essentials-group">必备 App</Text>
          <BulletList items={plan.essentials.apps} />
        </SectionCard>
      ) : null}

      <SectionCard title={plan.nightlife.title}>
        {plan.nightlife.spots.map((spot) => (
          <View key={spot.name} className="s-travel-guide-detail__named-item">
            <Text className="s-travel-guide-detail__named-item-title">{spot.name}</Text>
            <Text className="s-travel-guide-detail__named-item-note">{spot.note}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title={plan.tips.title}>
        <BulletList items={plan.tips.items} />
      </SectionCard>
    </View>
  );
}
