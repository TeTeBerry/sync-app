import type { TravelGuidePlan } from '@/types/travelGuide';
import { Text, View } from '@tarojs/components';
import {
  TravelGuideDetailBulletList,
  TravelGuideDetailNamedItem,
  TravelGuideDetailSection,
} from './TravelGuideDetailSection';

type TravelGuideDetailBodyProps = {
  plan: TravelGuidePlan;
};

export function TravelGuideDetailBody({ plan }: TravelGuideDetailBodyProps) {
  const accommodationSchemes = plan.accommodation.schemes ?? [];
  const featuredHotelNames = new Set(accommodationSchemes.map((s) => s.name));
  const moreHotels = plan.accommodation.hotels.filter(
    (hotel) => !featuredHotelNames.has(hotel.name),
  );

  return (
    <>
      {plan.documents?.items.length ? (
        <TravelGuideDetailSection title={plan.documents.title} accent="docs">
          <TravelGuideDetailBulletList items={plan.documents.items} />
        </TravelGuideDetailSection>
      ) : null}

      {plan.tickets?.channels.length ? (
        <TravelGuideDetailSection title={plan.tickets.title} accent="ticket">
          {plan.tickets.channels.map((channel) => (
            <TravelGuideDetailNamedItem
              key={channel.name}
              title={channel.name}
              note={channel.note}
            />
          ))}
        </TravelGuideDetailSection>
      ) : null}

      <TravelGuideDetailSection title={plan.transport.title} accent="transport">
        <TravelGuideDetailBulletList items={plan.transport.lines} />
      </TravelGuideDetailSection>

      {plan.venueTransport?.options.length ? (
        <TravelGuideDetailSection title={plan.venueTransport.title} accent="venue">
          {plan.venueTransport.options.map((option) => (
            <View key={option.label} className="s-travel-guide-detail__option-block">
              <Text className="s-travel-guide-detail__option-label">
                {option.label}
              </Text>
              <TravelGuideDetailBulletList items={option.lines} />
            </View>
          ))}
        </TravelGuideDetailSection>
      ) : null}

      <TravelGuideDetailSection title={plan.accommodation.title} accent="hotel">
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
              <TravelGuideDetailNamedItem
                key={hotel.name}
                title={hotel.name}
                note={hotel.note}
                reason={hotel.reason}
                bookingHint={hotel.bookingHint}
              />
            ))}
          </View>
        ) : null}
        {!accommodationSchemes.length
          ? plan.accommodation.hotels.map((hotel) => (
              <TravelGuideDetailNamedItem
                key={hotel.name}
                title={hotel.name}
                note={hotel.note}
                reason={hotel.reason}
              />
            ))
          : null}
      </TravelGuideDetailSection>

      {plan.budget?.items.length ? (
        <TravelGuideDetailSection title={plan.budget.title} accent="budget">
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
        </TravelGuideDetailSection>
      ) : null}

      {plan.parking?.lines.length ? (
        <TravelGuideDetailSection title={plan.parking.title} accent="venue">
          <TravelGuideDetailBulletList items={plan.parking.lines} />
        </TravelGuideDetailSection>
      ) : null}

      {plan.essentials ? (
        <TravelGuideDetailSection title={plan.essentials.title} accent="essentials">
          <Text className="s-travel-guide-detail__essentials-group">网络</Text>
          <TravelGuideDetailBulletList items={plan.essentials.network} />
          <Text className="s-travel-guide-detail__essentials-group">支付</Text>
          <TravelGuideDetailBulletList items={plan.essentials.payment} />
          <Text className="s-travel-guide-detail__essentials-group">必备 App</Text>
          <TravelGuideDetailBulletList items={plan.essentials.apps} />
        </TravelGuideDetailSection>
      ) : null}

      <TravelGuideDetailSection title={plan.nightlife.title} accent="nightlife">
        {plan.nightlife.spots.map((spot) => (
          <TravelGuideDetailNamedItem
            key={spot.name}
            title={spot.name}
            note={spot.note}
            reason={spot.reason}
          />
        ))}
      </TravelGuideDetailSection>

      <TravelGuideDetailSection title={plan.tips.title} accent="tips">
        <TravelGuideDetailBulletList items={plan.tips.items} />
      </TravelGuideDetailSection>
    </>
  );
}
