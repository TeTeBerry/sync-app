import "./TicketTradeModal.scss";
import React, { useEffect, useState } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TicketIcon,
  XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Input } from "./ui";

export type TicketTradeMode = `sell` | `buy`;

export interface TicketTradeFormValues {
  eventName: string;
  eventDate: string;
  seat: string;
  quantity: number;
  unitPrice: number;
  contact: string;
  mode: TicketTradeMode;
}

export interface TicketTradeModalProps {
  open: boolean;
  mode: TicketTradeMode;
  onClose: () => void;
  onSubmit?: (values: TicketTradeFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const TicketTradeModal: React.FC<TicketTradeModalProps> = ({
  open,
  mode,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError,
}) => {
  const { t } = useTranslation();
  const [eventName, setEventName] = useState(``);
  const [eventDate, setEventDate] = useState(``);
  const [seat, setSeat] = useState(``);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [contact, setContact] = useState(``);

  const resetForm = () => {
    setEventName(``);
    setEventDate(``);
    setSeat(``);
    setQuantity(1);
    setUnitPrice(0);
    setContact(``);
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open, mode]);

  const isSell = mode === `sell`;
  const HeaderIcon = isSell ? ArrowUpRightIcon : ArrowDownLeftIcon;

  const seatPlaceholder = isSell
    ? t(`aimatch.ticket.modal.seatSell`)
    : t(`aimatch.ticket.modal.seatBuy`);

  const priceLabel = isSell
    ? t(`aimatch.ticket.modal.unitPriceSell`)
    : t(`aimatch.ticket.modal.unitPriceBuy`);

  const eventPlaceholder = isSell
    ? t(`aimatch.ticket.modal.eventNameSell`)
    : t(`aimatch.ticket.modal.eventNameBuy`);

  const handleSubmit = async () => {
    if (!onSubmit || isSubmitting) return;

    await onSubmit({
      eventName: eventName.trim(),
      eventDate: eventDate.trim(),
      seat: seat.trim(),
      quantity,
      unitPrice,
      contact: contact.trim(),
      mode,
    });
  };

  const canSubmit =
    eventName.trim() &&
    eventDate.trim() &&
    seat.trim() &&
    unitPrice > 0 &&
    contact.trim();

  return (
    <div className={`s-ticket-modal${open ? `` : ` s-ticket-modal--off`}`}>
      <div className="s-ticket-modal__backdrop" onClick={onClose} />

      <div className={`s-ticket-modal__sheet s-ticket-modal__sheet--${mode}`}>
        <div className="s-ticket-modal__head">
          <div className="s-ticket-modal__head-main">
            <div className={`s-ticket-modal__head-icon s-ticket-modal__head-icon--${mode}`}>
              <HeaderIcon size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2>{t(isSell ? `aimatch.ticket.sell` : `aimatch.ticket.buy`)}</h2>
              <p>{t(isSell ? `aimatch.ticket.modal.subtitleSell` : `aimatch.ticket.modal.subtitleBuy`)}</p>
            </div>
          </div>
          <Button block="s-ticket-modal" element="close" onClick={onClose}>
            <XIcon size={14} />
          </Button>
        </div>

        <div className="s-ticket-modal__fields">
          <Input
            variant="ticket-field"
            icon={<TicketIcon size={16} />}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder={eventPlaceholder}
          />

          <Input
            variant="ticket-field"
            icon={<CalendarIcon size={16} />}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder={t(`aimatch.ticket.modal.eventDate`)}
          />

          <div className="s-ticket-modal__row">
            <Input
              variant="ticket-field"
              fieldModifier="seat"
              icon={<SlidersHorizontalIcon size={16} />}
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              placeholder={seatPlaceholder}
            />

            <div className={`s-ticket-modal__stepper-wrap s-ticket-modal__stepper-wrap--${mode}`}>
              <span className="s-ticket-modal__stepper-label">{t(`aimatch.ticket.modal.quantity`)}</span>
              <div className="s-ticket-modal__stepper">
                <Button
                  block="s-ticket-modal"
                  element="stepper-btn"
                  onClick={() => setQuantity((q) => clampInt(q - 1, 1, 99))}
                  aria-label={t(`aimatch.ticket.modal.decrease`)}
                >
                  <MinusIcon size={14} />
                </Button>
                <span className="s-ticket-modal__stepper-value">{quantity}</span>
                <Button
                  block="s-ticket-modal"
                  element="stepper-btn"
                  modifiers={[`plus`]}
                  onClick={() => setQuantity((q) => clampInt(q + 1, 1, 99))}
                  aria-label={t(`aimatch.ticket.modal.increase`)}
                >
                  <PlusIcon size={14} />
                </Button>
              </div>
            </div>
          </div>

          <div className={`s-ticket-modal__price-block s-ticket-modal__price-block--${mode}`}>
            <div className="s-ticket-modal__price-label">
              <span className={`s-ticket-modal__price-icon s-ticket-modal__price-icon--${mode}`}>¥</span>
              <span>{priceLabel}</span>
            </div>
            <div className="s-ticket-modal__price-stepper">
              <span className="s-ticket-modal__price-currency">¥</span>
              <Button
                block="s-ticket-modal"
                element="stepper-btn"
                onClick={() => setUnitPrice((p) => clampInt(p - 10, 0, 999999))}
                aria-label={t(`aimatch.ticket.modal.decrease`)}
              >
                <MinusIcon size={14} />
              </Button>
              <input
                type="text"
                inputMode="numeric"
                className="s-ticket-modal__price-input"
                value={unitPrice}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, ``);
                  setUnitPrice(digits === `` ? 0 : clampInt(Number.parseInt(digits, 10), 0, 999999));
                }}
                aria-label={priceLabel}
              />
              <Button
                block="s-ticket-modal"
                element="stepper-btn"
                modifiers={[`plus`]}
                onClick={() => setUnitPrice((p) => clampInt(p + 10, 0, 999999))}
                aria-label={t(`aimatch.ticket.modal.increase`)}
              >
                <PlusIcon size={14} />
              </Button>
              <span className="s-ticket-modal__price-suffix">{t(`aimatch.ticket.modal.perTicket`)}</span>
            </div>
          </div>

          <Input
            variant="ticket-field"
            icon={<PhoneIcon size={16} />}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t(`aimatch.ticket.modal.contact`)}
          />

          {submitError ? <p className="s-ticket-modal__error">{submitError}</p> : null}
        </div>

        <Button
          block="s-ticket-modal"
          element="submit"
          modifiers={[mode]}
          disabled={isSubmitting || !canSubmit}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting
            ? t(`common.loading`)
            : t(isSell ? `aimatch.ticket.modal.submitSell` : `aimatch.ticket.modal.submitBuy`)}
        </Button>
      </div>
    </div>
  );
};

export default TicketTradeModal;
