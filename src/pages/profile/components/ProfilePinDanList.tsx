import Taro from "@tarojs/taro";
import React, { useCallback } from "react";
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  PackageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { goPindan } from "../../../utils/route";
import type { ProfilePinDanCategory, ProfilePinDanItem } from "../mockData";

export type ProfilePinDanListProps = {
  items: ProfilePinDanItem[];
  highlightId?: number | null;
  onExit: (id: number) => void;
};

const categoryIcons: Record<ProfilePinDanCategory, typeof PackageIcon> = {
  package: PackageIcon,
  hotel: BuildingIcon,
  transport: CarIcon,
};

const ProfilePinDanList: React.FC<ProfilePinDanListProps> = ({ items, highlightId = null, onExit }) => {
  const { t } = useTranslation();

  const handleMore = useCallback(() => {
    goPindan();
  }, []);

  const handleViewDetail = useCallback((item: ProfilePinDanItem) => {
    goPindan(item.activityId);
  }, []);

  const handleExit = useCallback(
    (item: ProfilePinDanItem) => {
      void Taro.showModal({
        title: t("profile.myPindan.exitConfirmTitle"),
        content: t("profile.myPindan.exitConfirmMessage", { title: item.title }),
        confirmText: t("profile.myPindan.exit"),
        confirmColor: "#ff0066",
        success: (res) => {
          if (res.confirm) {
            onExit(item.id);
            void Taro.showToast({ title: t("profile.myPindan.exitSuccess"), icon: "success" });
          }
        },
      });
    },
    [onExit, t],
  );

  return (
    <div className="s-profile-pindan">
      <div className="s-profile-pindan__head">
        <div className="s-profile-pindan__head-left">
          <span className="s-profile-pindan__head-icon" aria-hidden>
            <CheckCircle2Icon size={14} />
          </span>
          <span className="s-profile-pindan__head-title">{t("profile.myPindan.title")}</span>
          <span className="s-profile-pindan__head-badge">{items.length}</span>
        </div>
        <button type="button" className="s-profile-pindan__more" onClick={handleMore}>
          <span>{t("profile.myPindan.more")}</span>
          <ArrowRightIcon size={14} />
        </button>
      </div>

      <div className="s-profile-pindan__list">
        {items.length === 0 ? (
          <div className="s-profile-pindan__empty">{t("profile.myPindan.empty")}</div>
        ) : (
          items.map((item) => {
            const TagIcon = categoryIcons[item.category];

            return (
              <article
                key={item.id}
                id={`profile-pindan-${item.id}`}
                className={`s-profile-pindan__card${highlightId === item.id ? " s-profile-pindan__card--focused" : ""}`}
              >
                <div className="s-profile-pindan__card-body">
                  <div className="s-profile-pindan__thumb-wrap">
                    <img className="s-profile-pindan__thumb" src={item.image} alt="" />
                    <span className="s-profile-pindan__joined-badge">
                      <CheckCircle2Icon size={10} />
                      {t("profile.myPindan.joinedBadge")}
                    </span>
                  </div>

                  <div className="s-profile-pindan__content">
                    <span className="s-profile-pindan__tag">
                      <TagIcon size={10} />
                      {t(`profile.myPindan.category.${item.category}`)}
                    </span>

                    <h3 className="s-profile-pindan__title">{item.title}</h3>
                    <p className="s-profile-pindan__subtitle">{item.subtitle}</p>

                    <div className="s-profile-pindan__meta">
                      <span className="s-profile-pindan__meta-item">
                        <CalendarIcon size={12} />
                        {item.date}
                      </span>
                      <span className="s-profile-pindan__meta-item">
                        <MapPinIcon size={12} />
                        {item.location}
                      </span>
                    </div>

                    <div className="s-profile-pindan__price">
                      <span className="s-profile-pindan__price-currency">¥</span>
                      <span className="s-profile-pindan__price-value">{item.price}</span>
                    </div>
                  </div>
                </div>

                <div className="s-profile-pindan__divider" />

                <div className="s-profile-pindan__foot">
                  <span className="s-profile-pindan__joined-at">
                    <ClockIcon size={12} />
                    {t("profile.myPindan.joinedAt", { time: item.joinedAt })}
                  </span>

                  <div className="s-profile-pindan__actions">
                    <button type="button" className="s-profile-pindan__btn s-profile-pindan__btn--ghost" onClick={() => handleExit(item)}>
                      {t("profile.myPindan.exit")}
                    </button>
                    <button type="button" className="s-profile-pindan__btn s-profile-pindan__btn--primary" onClick={() => handleViewDetail(item)}>
                      {t("profile.myPindan.viewDetail")}
                      <ArrowRightIcon size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProfilePinDanList;
