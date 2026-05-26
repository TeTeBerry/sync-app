import React, { useMemo } from "react";
import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { MetaRow } from "../../../components/MetaRow";
import { ProfileCollapsibleSection } from "../../../components/profile/ProfileCollapsibleSection";
import type { ProfileActivityItem } from "../../../types/backend";
import { compareActivityDateDesc } from "../../../utils/activityStatus";

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
}) => {
  const { t } = useTranslation();
  const sortedItems = useMemo(
    () => [...items].sort(compareActivityDateDesc),
    [items],
  );

  return (
    <ProfileCollapsibleSection
      variant="activities"
      icon={<TicketIcon size={14} />}
      title={t("profile.myActivities.title")}
      items={sortedItems}
    >
      {(pageItems) =>
        pageItems.map((item) => (
          <article key={item.id} className="s-profile-activity">
            <ImageWithFallback
              src={item.image}
              alt=""
              imageClassName="s-profile-activity__thumb"
              placeholderClassName="s-profile-activity__thumb s-profile-activity__thumb--placeholder"
              fallback={item.title.slice(0, 2)}
            />
            <div className="s-profile-activity__content">
              <div className="s-profile-activity__top">
                <h3 className="s-profile-activity__title">{item.title}</h3>
                <span className="s-profile-activity__status">
                  {t(`profile.eventStatus.${item.status}`)}
                </span>
              </div>

              <div className="s-profile-activity__meta">
                <MetaRow className="s-profile-activity__meta-item" icon={<CalendarIcon size={12} />}>
                  {item.date}
                </MetaRow>
                <MetaRow className="s-profile-activity__meta-item" icon={<MapPinIcon size={12} />}>
                  {item.location}
                </MetaRow>
              </div>
            </div>
          </article>
        ))
      }
    </ProfileCollapsibleSection>
  );
};

export default ProfileActivitiesSection;
