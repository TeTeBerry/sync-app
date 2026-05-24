import "./CreatePinDanModal.scss";
import React, { type ComponentType, useEffect, useMemo, useState } from "react";
import { MapPinIcon, PackageIcon, SparklesIcon, XIcon, ZapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMockHotelAddressSuggestions, type HotelAddressSuggestion } from "../data/mockHotelAddresses";
import { Button, Input } from "./ui";
import MiniCalendar, { formatDate, type MiniCalendarAccent } from "./MiniCalendar";

export type PinDanCreateCategory = `package` | `hotel` | `transport`;

const DEFAULT_CATEGORY_OPTIONS: PinDanCreateCategory[] = [`hotel`, `transport`];

const categoryIcons: Record<PinDanCreateCategory, ComponentType<{ size?: number | string }>> = {
  package: PackageIcon,
  hotel: MapPinIcon,
  transport: ZapIcon,
};

const groupLabelKey: Record<PinDanCreateCategory, string> = {
  package: `pindan.tabs.package`,
  hotel: `aimatch.pindan.hotelGroup`,
  transport: `aimatch.pindan.transportGroup`,
};

const accentMap: Record<PinDanCreateCategory, MiniCalendarAccent> = {
  package: `primary`,
  hotel: `secondary`,
  transport: `amber`,
};

export interface CreatePinDanModalProps {
  open: boolean;
  onClose: () => void;
  categoryOptions?: PinDanCreateCategory[];
  defaultCategory?: PinDanCreateCategory;
  initialEventName?: string;
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
}) => {
  const { t } = useTranslation();
  const optionsKey = categoryOptions.join(`,`);
  const options = useMemo(
    () => (categoryOptions.length > 0 ? categoryOptions : DEFAULT_CATEGORY_OPTIONS),
    [optionsKey, categoryOptions],
  );
  const showTypePicker = options.length > 1;

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

  const resetFormFields = () => {
    setEventDate(formatDate(new Date()));
    setEventName(initialEventName);
    setLocation(``);
    setHotelName(``);
    setAddressLoading(false);
    setAddressOptions([]);
    setSelectedAddressId(null);
    setTotalPrice(``);
    setGroupSize(``);
  };

  useEffect(() => {
    if (!open) return;
    const next =
      defaultCategory && options.includes(defaultCategory) ? defaultCategory : options[0];
    setCategory(next);
    resetFormFields();
  }, [open, defaultCategory, initialEventName, options]);

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

  return (
    <div className={`s-aim-modal${open ? `` : ` s-aim-modal--off`}`}>
      <div className="s-aim-modal__backdrop" onClick={onClose} />

      <div className="s-aim-modal__sheet">
        <div className="s-aim-modal__head">
          <h2>{t("aimatch.pindan.modal.title")}</h2>
          <Button block="s-aim-modal" element="close" onClick={onClose}>
            <XIcon size={14} />
          </Button>
        </div>

        {showTypePicker && (
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
          <Input
            variant="aim-modal-full"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder={t("aimatch.pindan.modal.eventName")}
          />
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
        </div>

        <Button block="s-aim-modal" element="submit" modifiers={[category]} onClick={onClose}>
          {t("aimatch.pindan.modal.submit")}
        </Button>
      </div>
    </div>
  );
};

export default CreatePinDanModal;
