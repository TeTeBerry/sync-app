import type { AccountRiskPublicStatus, AccountRiskReasonCode } from '../types/backend';

export function formatAccountRiskUntil(iso?: string): string | null {
  if (!iso?.trim()) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function accountRiskReasonLabel(code?: AccountRiskReasonCode): string {
  switch (code) {
    case 'scalper':
      return '黄牛/票务相关';
    case 'reports':
      return '用户举报';
    case 'content':
      return '内容违规';
    default:
      return '平台风控';
  }
}

export function accountRiskStatusTitle(
  accountRisk?: AccountRiskPublicStatus | null,
): string {
  if (accountRisk?.status === 'banned') return '账号已限制';
  return '发帖功能已暂停';
}
