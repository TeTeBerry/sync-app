import type { ReportCategory } from '../types/backend';

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  ads: '广告引流',
  scalper: '黄牛/欺诈',
  vulgar: '低俗骚扰',
};

export function reportCategoryLabel(category?: ReportCategory): string {
  if (!category) return '违规内容';
  return CATEGORY_LABELS[category] ?? category;
}

const REPORT_SUBMITTED_BODY = [
  '我们已收到你的举报，感谢帮助维护社区环境。',
  '',
  '处理流程：',
  '1. 系统记录并进入核实队列',
  '2. 核实后将按规则处理（隐藏内容或限制发帖）',
  '3. 黄牛/欺诈类举报会累计计入对方账号风控',
  '',
  '同一内容无需重复举报。处理结果不会单独通知举报人，但会体现在对方账号限制中。',
].join('\n');

export function formatReportSubmittedCopy(): string {
  return REPORT_SUBMITTED_BODY;
}

export const REPORT_SUBMITTED_MODAL = {
  title: '举报已提交',
  content: REPORT_SUBMITTED_BODY,
  confirmText: '知道了',
} as const;
