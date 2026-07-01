import './index.scss';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input, Text, View } from '@tarojs/components';
import { Button, Sheet } from '../ui';
import { X } from '../icons';
import { useLoginInterceptStore } from '../../stores/loginInterceptStore';
import { sendSmsCode, loginWithPhone } from '../../utils/auth';
import { invalidateProfileSummary } from '../../utils/queryInvalidation';
import { isLiveApi } from '../../constants/api';
import { showAppToast } from '@/utils/appToast';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';
import {
  clearSmsCooldownRecord,
  getSmsCooldownSeconds,
  readSmsCooldownRecord,
  resolveSmsCooldownSeconds,
  saveSmsCooldownRecord,
} from '@/utils/authSmsCooldown';
import { goLegalDocument } from '@/utils/legalRoute';
import { useT } from '@/hooks/useI18n';

const DEFAULT_COUNTDOWN_SEC = 60;
const PHONE_DIGITS = 11;
const CODE_DIGITS = 6;

function normalizeDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function formatPhoneDisplay(value: string): string {
  const digits = normalizeDigits(value, PHONE_DIGITS);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
}

function maskPhone(value: string): string {
  const digits = normalizeDigits(value, PHONE_DIGITS);
  if (digits.length < PHONE_DIGITS) return formatPhoneDisplay(digits);
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

export function PhoneLoginModal() {
  const t = useT();
  const open = useLoginInterceptStore((state) => state.isOpen);
  const close = useLoginInterceptStore((state) => state.close);
  const completeAfterLogin = useLoginInterceptStore(
    (state) => state.completeAfterLogin,
  );

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cooldownPhone, setCooldownPhone] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneDigits = useMemo(() => normalizeDigits(phone, PHONE_DIGITS), [phone]);
  const codeDigits = useMemo(() => normalizeDigits(code, CODE_DIGITS), [code]);
  const phoneValid = /^1[3-9]\d{9}$/.test(phoneDigits);
  const codeComplete = /^\d{6}$/.test(codeDigits);
  const activeCooldown = cooldownPhone === phoneDigits ? countdown : 0;
  const canSend = phoneValid && !sending && activeCooldown <= 0;
  const canLogin = phoneValid && codeComplete && !loggingIn;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyCooldown = useCallback(
    (nextPhone: string, seconds: number, options?: { markCodeSent?: boolean }) => {
      const safeSeconds = Math.max(1, seconds);
      saveSmsCooldownRecord(nextPhone, safeSeconds);
      setCooldownPhone(nextPhone);
      setCountdown(safeSeconds);
      if (options?.markCodeSent ?? true) {
        setCodeSent(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (countdown <= 0) {
      clearTimer();
      if (cooldownPhone) {
        const stored = readSmsCooldownRecord();
        if (!stored || stored.phone === cooldownPhone) {
          clearSmsCooldownRecord();
        }
        setCooldownPhone('');
      }
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }

    return clearTimer;
  }, [clearTimer, countdown, cooldownPhone]);

  useEffect(() => {
    if (!open) {
      clearTimer();
      return;
    }

    const record = readSmsCooldownRecord();
    const remaining = getSmsCooldownSeconds(record?.phone);

    setCode('');
    setError('');
    setSending(false);
    setLoggingIn(false);

    if (record && remaining > 0) {
      setPhone(formatPhoneDisplay(record.phone));
      setCooldownPhone(record.phone);
      setCountdown(remaining);
      setCodeSent(true);
      return;
    }

    clearSmsCooldownRecord();
    setPhone('');
    setCodeSent(false);
    setCountdown(0);
    setCooldownPhone('');
  }, [clearTimer, open]);

  useEffect(() => {
    if (!open || !phoneValid || sending) return;

    const remaining = getSmsCooldownSeconds(phoneDigits);
    if (remaining > 0) {
      setCooldownPhone(phoneDigits);
      setCountdown(remaining);
    } else if (cooldownPhone === phoneDigits && countdown <= 0) {
      setCooldownPhone('');
    }
  }, [countdown, cooldownPhone, open, phoneDigits, phoneValid, sending]);

  const handleSendCode = useCallback(async () => {
    if (!phoneValid) {
      setError(t('auth.phoneInvalid'));
      return;
    }
    if (!isLiveApi()) {
      showAppToast('auth.configureApi', { icon: 'none' });
      return;
    }

    setError('');
    setSending(true);

    try {
      await sendSmsCode(phoneDigits);
      applyCooldown(phoneDigits, DEFAULT_COUNTDOWN_SEC);
      showAppToast('auth.smsSent', { icon: 'success' });
    } catch (err: unknown) {
      const cooldownSeconds = resolveSmsCooldownSeconds(err);
      if (cooldownSeconds) {
        applyCooldown(phoneDigits, cooldownSeconds);
      }
      setError(
        cooldownSeconds
          ? t('auth.smsRetryIn', { seconds: cooldownSeconds })
          : getApiErrorMessage(err, t('auth.smsSendFailed')),
      );
    } finally {
      setSending(false);
    }
  }, [applyCooldown, phoneDigits, phoneValid, t]);

  const handleLogin = useCallback(async () => {
    if (!phoneValid || !codeComplete) {
      setError(t('auth.phoneCodeMissing'));
      return;
    }

    setError('');
    setLoggingIn(true);

    try {
      await loginWithPhone(phoneDigits, codeDigits);
      void invalidateProfileSummary();
      completeAfterLogin();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t('auth.loginFailed')));
    } finally {
      setLoggingIn(false);
    }
  }, [codeComplete, codeDigits, completeAfterLogin, phoneDigits, phoneValid, t]);

  const handleClose = useCallback(() => {
    setCode('');
    setError('');
    close();
  }, [close]);

  const handlePhoneInput = useCallback((value: string) => {
    setPhone(normalizeDigits(value, PHONE_DIGITS));
    setError('');
  }, []);

  const handleCodeInput = useCallback((value: string) => {
    setCode(normalizeDigits(value, CODE_DIGITS));
    setError('');
  }, []);

  const handleCodeConfirm = useCallback(() => {
    if (canLogin) {
      void handleLogin();
    }
  }, [canLogin, handleLogin]);

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      overlayClassName="s-login-intercept s-login-intercept--phone"
      panelClassName="s-phone-login__panel"
      zIndex="var(--overlay-z-dialog)"
      panelRole="dialog"
      panelAriaModal={open}
    >
      <Button className="s-phone-login__close" onClick={handleClose}>
        <X size={18} color="#8e8e93" />
      </Button>

      <View className="s-phone-login">
        <View className="s-phone-login__hero">
          <Text className="s-phone-login__title">{t('auth.phoneLoginTitle')}</Text>
          <Text className="s-phone-login__subtitle">
            {t('auth.phoneLoginSubtitle')}
          </Text>
        </View>

        <View className="s-phone-login__section">
          <Text className="s-phone-login__section-title">
            {t('auth.phoneFieldLabel')}
          </Text>

          <View
            className={[
              's-phone-login__field-card',
              phoneValid ? 's-phone-login__field-card--ready' : '',
              codeSent ? 's-phone-login__field-card--locked' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <View className="s-phone-login__phone-row">
              <View className="s-phone-login__country-pill">
                <Text className="s-phone-login__country-code">+86</Text>
              </View>
              <Input
                className="s-phone-login__phone-input"
                type="tel"
                maxlength={13}
                placeholder={t('auth.phonePlaceholder')}
                value={
                  codeSent ? formatPhoneDisplay(phoneDigits) : formatPhoneDisplay(phone)
                }
                disabled={codeSent}
                onInput={(e) => handlePhoneInput(e.detail.value)}
                onFocus={() => {
                  if (!codeSent) {
                    setPhone(phoneDigits);
                  }
                }}
                onBlur={() => {
                  if (!codeSent) {
                    setPhone(formatPhoneDisplay(phoneDigits));
                  }
                }}
              />
            </View>

            {!codeSent ? (
              <View className="s-phone-login__row-meta">
                <Text className="s-phone-login__assistive">{t('auth.phoneHint')}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View
          className={[
            's-phone-login__section',
            !codeSent ? 's-phone-login__section--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Text className="s-phone-login__section-title">
            {t('auth.codeFieldLabel')}
          </Text>

          <View
            className={[
              's-phone-login__field-card',
              codeSent ? 's-phone-login__field-card--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <View className="s-phone-login__code-row">
              {!codeSent ? (
                <Button
                  className={[
                    's-phone-login__send-btn',
                    !canSend ? 's-phone-login__send-btn--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!canSend ? true : undefined}
                  loading={sending}
                  onClick={canSend ? handleSendCode : undefined}
                >
                  {sending ? '' : t('auth.sendCode')}
                </Button>
              ) : (
                <>
                  {/* hidden real input — captures keyboard */}
                  <Input
                    className="s-phone-login__code-input-hidden"
                    type="text"
                    maxlength={CODE_DIGITS}
                    value={codeDigits}
                    focus
                    onInput={(e) => handleCodeInput(e.detail.value)}
                    onConfirm={handleCodeConfirm}
                  />
                  {/* 6 visual boxes */}
                  <View className="s-phone-login__otp-boxes">
                    {Array.from({ length: CODE_DIGITS }).map((_, i) => (
                      <View
                        key={i}
                        className={[
                          's-phone-login__otp-box',
                          codeDigits[i] ? 's-phone-login__otp-box--filled' : '',
                          i === codeDigits.length
                            ? 's-phone-login__otp-box--active'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Text className="s-phone-login__otp-box-digit">
                          {codeDigits[i] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            {codeSent ? (
              <View className="s-phone-login__row-meta">
                {activeCooldown > 0 ? (
                  <Text className="s-phone-login__minor-btn s-phone-login__cooldown-text">
                    {t('auth.smsCountdown', { seconds: activeCooldown })}
                  </Text>
                ) : (
                  <Button
                    className="s-phone-login__minor-btn"
                    loading={sending}
                    onClick={handleSendCode}
                  >
                    {t('auth.resendCode')}
                  </Button>
                )}
              </View>
            ) : null}
          </View>
        </View>

        <View
          className={[
            's-phone-login__feedback',
            error ? 's-phone-login__feedback--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Text className="s-phone-login__feedback-text">{error || '\u00A0'}</Text>
        </View>

        <Button
          className={[
            's-phone-login__submit',
            !canLogin ? 's-phone-login__submit--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={!canLogin ? true : undefined}
          loading={loggingIn}
          onClick={handleLogin}
        >
          {loggingIn ? '' : t('auth.loginContinue')}
        </Button>

        <View className="s-phone-login__legal">
          <Text className="s-phone-login__legal-copy">{t('auth.legalPrefix')}</Text>
          <Text
            className="s-phone-login__legal-link"
            onClick={() => goLegalDocument('user-agreement')}
          >
            {t('legal.userAgreement')}
          </Text>
          <Text className="s-phone-login__legal-copy">{t('legal.consentAnd')}</Text>
          <Text
            className="s-phone-login__legal-link"
            onClick={() => goLegalDocument('privacy-policy')}
          >
            {t('legal.privacyPolicy')}
          </Text>
        </View>
      </View>
    </Sheet>
  );
}
