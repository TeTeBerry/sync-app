import "./LanguageSwitcher.scss";
import React, { useEffect, useRef, useState } from "react";
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type AppLocale, setAppLocale, SUPPORTED_LOCALES } from "../i18n";
import ActionSheet from "./ActionSheet";
import { cn } from "./ui";

type LanguageSwitcherProps = {
  variant?: "panel" | "header" | "icon";
};

const localeLabels: Record<AppLocale, string> = {
  zh: "language.zh",
  en: "language.en",
  th: "language.th",
};

const localeShort: Record<AppLocale, string> = {
  zh: "中",
  en: "EN",
  th: "TH",
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "panel" }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = (i18n.resolvedLanguage?.split(`-`)[0] ?? i18n.language.split(`-`)[0]) as AppLocale;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener(`mousedown`, onPointerDown);
    document.addEventListener(`touchstart`, onPointerDown);
    return () => {
      document.removeEventListener(`mousedown`, onPointerDown);
      document.removeEventListener(`touchstart`, onPointerDown);
    };
  }, [open]);

  const selectLocale = (locale: AppLocale) => {
    void setAppLocale(locale);
    setOpen(false);
    setSheetOpen(false);
  };

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          className="s-lang-switch__icon-btn"
          aria-label={t("language.title")}
          onClick={() => setSheetOpen(true)}
        >
          <GlobeIcon size={18} />
        </button>
        <ActionSheet
          open={sheetOpen}
          title={t("language.title")}
          cancelLabel={t("common.cancel")}
          onCancel={() => setSheetOpen(false)}
          items={SUPPORTED_LOCALES.map((locale) => ({
            label: t(localeLabels[locale]),
            active: current === locale,
            onSelect: () => selectLocale(locale),
          }))}
        />
      </>
    );
  }

  if (variant === "header") {
    return (
      <div ref={rootRef} className="s-lang-switch s-lang-switch--header">
        <button
          type="button"
          className="s-lang-switch__trigger"
          aria-label={t("language.title")}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <GlobeIcon size={16} />
          <span>{localeShort[current] ?? localeShort.zh}</span>
        </button>

        {open && (
          <div className="s-overlay-popover" role="menu">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                role="menuitem"
                className={cn(
                  "s-overlay-popover__item",
                  current === locale && "s-overlay-popover__item--active",
                )}
                onClick={() => selectLocale(locale)}
              >
                {t(localeLabels[locale])}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="s-lang-switch">
      <span className="s-lang-switch__title">{t("language.title")}</span>
      <div className="s-lang-switch__options">
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            className={`s-lang-switch__btn${current === locale ? " s-lang-switch__btn--active" : ""}`}
            onClick={() => selectLocale(locale)}
          >
            {t(localeLabels[locale])}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
