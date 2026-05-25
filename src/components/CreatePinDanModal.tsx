import "./CreatePinDanModal.scss";
import React, { type ComponentType, useEffect, useMemo, useState } from "react";
import { BuildingIcon, CalendarIcon, CarIcon, FlameIcon, MapPinIcon, PackageIcon, SparklesIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Taro from "@tarojs/taro";
import { createPindan, updatePindan } from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import type { PindanJoinCard } from "../types/aiChat";
import { getClientUserId } from "../utils/session";
import { getMockHotelAddressSuggestions, type HotelAddressSuggestion } from "../data/mockHotelAddresses";
import { Button, Input } from "./ui";
import MiniCalendar, { formatDate, type MiniCalendarAccent } from "./MiniCalendar";

export type PinDanCreateCategory = `package` | `hotel` | `transport`;

export type PinDanActivityBrief = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  hot?: boolean;
};

const DEFAULT_CATEGORY_OPTIONS: PinDanCreateCategory[] = [`hotel`, `transport`];

const categoryIcons: Record<PinDanCreateCategory, ComponentType<{ size?: number | string }>> = {
  package: PackageIcon,
  hotel: BuildingIcon,
  transport: CarIcon,
};

const groupLabelKey: Record<PinDanCreateCategory, string> = {
  package: `pindan.tabs.package`,
  hotel: `aimatch.pindan.hotelGroup`,
  transport: `aimatch.pindan.transportGroup`,
};

const createTypeLabelKey: Record<PinDanCreateCategory, string> = {
  package: `pindan.create.typePackage`,
  hotel: `pindan.create.typeHotel`,
  transport: `pindan.create.typeTransport`,
};

const accentMap: Record<PinDanCreateCategory, MiniCalendarAccent> = {
  package: `primary`,
  hotel: `secondary`,
  transport: `amber`,
};

export type PinDanSavedResult = {
  legacyId: number;
  activityLegacyId?: number;
  category: PinDanCreateCategory;
  isEdit: boolean;
};

export interface CreatePinDanModalProps {
  open: boolean;
  onClose: () => void;
  categoryOptions?: PinDanCreateCategory[];
  defaultCategory?: PinDanCreateCategory;
  initialEventName?: string;
  /** 拼单页传入当前活动，展示活动卡片并启用备注等样式 */
  activity?: PinDanActivityBrief | null;
  /** AI 聊天中编辑自己创建的拼单 */
  editPindan?: PindanJoinCard | null;
  onSaved?: (result?: PinDanSavedResult) => void;
}

function parsePositiveInt(v: string): number | null {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parsePositiveAmount(v: string): number | null {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const CreatePinDanModal: React.FC<CreatePinDanModalProps> = ({
  open,
  onClose,
  categoryOptions = DEFAULT_CATEGORY_OPTIONS,
  defaultCategory,
  initialEventName = ``,
  activity = null,
  editPindan = null,
  onSaved,
}) => {
  const { t } = useTranslation();
  const isEditMode = Boolean(editPindan?.legacyId);
  const optionsKey = categoryOptions.join(`,`);
  const options = useMemo(
    () => (categoryOptions.length > 0 ? categoryOptions : DEFAULT_CATEGORY_OPTIONS),
    [optionsKey, categoryOptions],
  );
  const showTypeGrid = options.length > 1;
  const showSingleType = options.length === 1;
  const hasActivityContext = Boolean(activity);
  const isPindanContext = options.length === 1;

  const [category, setCategory] = useState<PinDanCreateCategory>(options[0]);
  const [eventDate, setEventDate] = useState(() => formatDate(new Date()));
  const [eventName, setEventName] = useState(initialEventName);
  const [location, setLocation] = useState(``);
  const [hotelName, setHotelName] = useState(``);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressOptions, setAddressOptions] = useState<HotelAddressSuggestion[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(``);
  const [groupSize, setGroupSize] = useState(``);
  const [remark, setRemark] = useState(``);

  const resetFormFields = () => {
    setEventDate(formatDate(new Date()));
    setEventName(activity?.title ?? initialEventName);
    setLocation(``);
    setHotelName(``);
    setAddressLoading(false);
    setAddressOptions([]);
    setSelectedAddressId(null);
    setTotalPrice(``);
    setGroupSize(``);
    setRemark(``);
  };

  useEffect(() => {
    if (!open) return;
    const next =
      defaultCategory && options.includes(defaultCategory) ? defaultCategory : options[0];
    setCategory(next);

    if (editPindan) {
      setCategory(editPindan.category);
      setEventName(editPindan.title);
      setLocation(editPindan.location ?? ``);
      setRemark(editPindan.remark ?? ``);
      setGroupSize(String(editPindan.total ?? 2));
      const perPerson = editPindan.pricePerPerson ?? editPindan.price ?? 0;
      const total = editPindan.total ?? 2;
      setTotalPrice(perPerson > 0 ? String(Math.round(perPerson * total)) : ``);
      setEventDate(editPindan.date || formatDate(new Date()));
      return;
    }

    resetFormFields();
  }, [open, defaultCategory, initialEventName, options, activity?.title, editPindan]);

  useEffect(() => {
    if (category === `hotel`) {
      setLocation(``);
    } else {
      setHotelName(``);
      setAddressLoading(false);
      setAddressOptions([]);
      setSelectedAddressId(null);
    }
  }, [category]);

  useEffect(() => {
    if (category !== `hotel`) return;
    const trimmed = hotelName.trim();
    if (trimmed.length < 2) {
      setAddressLoading(false);
      setAddressOptions([]);
      setSelectedAddressId(null);
      return;
    }

    setAddressLoading(true);
    setSelectedAddressId(null);
    const timer = window.setTimeout(() => {
      setAddressOptions(getMockHotelAddressSuggestions(trimmed));
      setAddressLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [category, hotelName]);

  const perPersonPrice = useMemo(() => {
    const total = parsePositiveAmount(totalPrice);
    const size = parsePositiveInt(groupSize);
    if (total == null || size == null) return null;
    return Math.round((total / size) * 100) / 100;
  }, [totalPrice, groupSize]);

  const locationPlaceholder =
    category === `hotel`
      ? t(`aimatch.pindan.modal.hotelName`)
      : category === `transport`
        ? t(`aimatch.pindan.modal.transportRoute`)
        : t(`aimatch.pindan.modal.location`);

  const modalTitle = isEditMode
    ? t(`aimatch.pindan.editTitle`)
    : isPindanContext
      ? t(`pindan.create.title`)
      : t(`aimatch.pindan.modal.title`);

  const handleSubmit = async () => {
    if (isEditMode && editPindan) {
      if (!isApiEnabled()) {
        onSaved?.({ legacyId: editPindan.legacyId, activityLegacyId: editPindan.activityLegacyId, category: editPindan.category, isEdit: true });
        return;
      }
      try {
        const size = parsePositiveInt(groupSize) ?? editPindan.total ?? 2;
        const total = parsePositiveAmount(totalPrice);
        const pricePerPerson =
          total != null && size > 0
            ? Math.round(total / size)
            : (editPindan.pricePerPerson ?? editPindan.price);

        await updatePindan(editPindan.legacyId, {
          title: eventName.trim() || editPindan.title,
          remark: remark.trim(),
          price: pricePerPerson,
          originalPrice: total ?? undefined,
          total: size,
          location: location.trim() || editPindan.location,
          userId: getClientUserId(),
        });
        void Taro.showToast({ title: t(`aimatch.pindan.updated`), icon: `success` });
        onSaved?.({
          legacyId: editPindan.legacyId,
          activityLegacyId: editPindan.activityLegacyId,
          category: editPindan.category,
          isEdit: true,
        });
      } catch {
        void Taro.showToast({ title: t(`common.requestFailed`), icon: `none` });
      }
      return;
    }

    const size = parsePositiveInt(groupSize);
    const total = parsePositiveAmount(totalPrice);
    const title = eventName.trim() || activity?.title || initialEventName.trim();
    const resolvedLocation =
      category === `hotel`
        ? (addressOptions.find((opt) => opt.id === selectedAddressId)?.address ??
          hotelName.trim())
        : location.trim();

    if (!size || !total || !title) {
      void Taro.showToast({ title: t(`common.requestFailed`), icon: `none` });
      return;
    }

    if (!isApiEnabled()) {
      onClose();
      return;
    }

    try {
      const pricePerPerson = Math.round(total / size);
      const created = await createPindan({
        title,
        type: category,
        activityLegacyId: activity?.id,
        leaderUserId: getClientUserId(),
        price: pricePerPerson,
        originalPrice: total,
        date: eventDate,
        location: resolvedLocation,
        total: size,
        remark: remark.trim() || undefined,
        image: activity?.image,
      });

      if (!created.legacyId) {
        throw new Error(`Missing legacyId`);
      }

      void Taro.showToast({ title: t(`pindan.created`), icon: `success` });
      onSaved?.({
        legacyId: created.legacyId,
        activityLegacyId: created.activityLegacyId ?? activity?.id,
        category,
        isEdit: false,
      });
      onClose();
    } catch {
      void Taro.showToast({ title: t(`common.requestFailed`), icon: `none` });
    }
  };

  return (
    <div className={`s-aim-modal${open ? `` : ` s-aim-modal--off`}`}>
      <div className="s-aim-modal__backdrop" onClick={onClose} />

      <div className="s-aim-modal__sheet">
        <div className="s-aim-modal__head">
          <div className="s-aim-modal__head-text">
            <h2>{modalTitle}</h2>
            {isPindanContext && <p className="s-aim-modal__subtitle">{t(`pindan.create.subtitle`)}</p>}
          </div>
          <Button block="s-aim-modal" element="close" onClick={onClose}>
            <XIcon size={14} />
          </Button>
        </div>

        {hasActivityContext && activity && (
          <div className="s-aim-modal__activity-block">
            <span className="s-aim-modal__label">{t(`pindan.create.activity`)}</span>
            <div className="s-aim-modal__activity">
              <img className="s-aim-modal__activity-img" src={activity.image} alt="" />
              <div className="s-aim-modal__activity-body">
                <div className="s-aim-modal__activity-title">{activity.title}</div>
                <div className="s-aim-modal__activity-meta">
                  <span>
                    <CalendarIcon size={11} />
                    {activity.date}
                  </span>
                  <span>
                    <MapPinIcon size={11} />
                    {activity.location}
                  </span>
                </div>
              </div>
              {activity.hot && (
                <span className="s-aim-modal__activity-hot">
                  <FlameIcon size={10} />
                  {t(`common.hot`)}
                </span>
              )}
            </div>
          </div>
        )}

        {showSingleType && (
          <div className="s-aim-modal__type-block">
            <span className="s-aim-modal__label">{t(`pindan.create.pinType`)}</span>
            <div className={`s-aim-modal__type-row s-aim-modal__type-row--${category}`}>
              <span className="s-aim-modal__type-row-label">{t(createTypeLabelKey[category])}</span>
              <span className="s-aim-modal__type-radio s-aim-modal__type-radio--checked" aria-hidden />
            </div>
          </div>
        )}

        {showTypeGrid && (
          <>
            <span className="s-aim-modal__label">{t("aimatch.pindan.modal.selectType")}</span>
            <div className="s-aim-modal__type-grid">
              {options.map((key) => {
                const CatIcon = categoryIcons[key];
                return (
                  <Button
                    key={key}
                    block="s-aim-modal"
                    element="type-opt"
                    modifiers={[key, category === key && `selected`]}
                    onClick={() => setCategory(key)}
                  >
                    <CatIcon size={20} />
                    <span className="s-aim-modal__type-opt-label">{t(groupLabelKey[key])}</span>
                  </Button>
                );
              })}
            </div>
          </>
        )}

        <div className="s-aim-modal__fields">
          {!activity && (
            <Input
              variant="aim-modal-full"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={t("aimatch.pindan.modal.eventName")}
            />
          )}
          <span className="s-aim-modal__label">{t("aimatch.pindan.modal.eventDate")}</span>
          <MiniCalendar value={eventDate} onChange={setEventDate} accent={accentMap[category]} />

          {category === `hotel` ? (
            <>
              <Input
                variant="aim-modal-full"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder={t("aimatch.pindan.modal.hotelName")}
              />
              {(addressLoading || addressOptions.length > 0) && (
                <div className={`s-aim-modal__address-block s-aim-modal__address-block--${category}`}>
                  <div className="s-aim-modal__address-head">
                    <SparklesIcon size={12} />
                    <span>{t("aimatch.pindan.modal.aiAddress")}</span>
                  </div>
                  {addressLoading ? (
                    <p className="s-aim-modal__address-loading">{t("aimatch.pindan.modal.aiAddressLoading")}</p>
                  ) : (
                    <div className="s-aim-modal__address-list">
                      {addressOptions.map((opt) => (
                        <Button
                          key={opt.id}
                          block="s-aim-modal"
                          element="address-opt"
                          modifiers={[selectedAddressId === opt.id && `selected`]}
                          onClick={() => setSelectedAddressId(opt.id)}
                        >
                          <strong>{opt.title}</strong>
                          <span>{opt.address}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <Input
              variant="aim-modal-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={locationPlaceholder}
            />
          )}

          <div className="s-aim-modal__row2">
            <Input
              variant="aim-modal-half"
              type="number"
              inputMode="decimal"
              min={0}
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder={t("aimatch.pindan.modal.totalPrice")}
            />
            <Input
              variant="aim-modal-half"
              type="number"
              inputMode="numeric"
              min={1}
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              placeholder={t("aimatch.pindan.modal.groupSize")}
            />
          </div>
          {perPersonPrice != null && (
            <p className={`s-aim-modal__per-person s-aim-modal__per-person--${category}`}>
              {t("aimatch.pindan.modal.perPersonPreview", { amount: perPersonPrice })}
            </p>
          )}

          {(isPindanContext || isEditMode) && (
            <>
              <span className="s-aim-modal__label">{t(`pindan.create.remark`)}</span>
              <textarea
                className="s-aim-modal__remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t(`pindan.create.remarkPlaceholder`)}
                rows={3}
              />
            </>
          )}
        </div>

        <Button block="s-aim-modal" element="submit" modifiers={[category]} onClick={() => void handleSubmit()}>
          {isEditMode ? t(`aimatch.pindan.saveEdit`) : t("aimatch.pindan.modal.submit")}
        </Button>
      </div>
    </div>
  );
};

export default CreatePinDanModal;
