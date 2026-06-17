export function buildAiAssistantWelcomeText(activityTitle?: string): string {
  const trimmed = activityTitle?.trim();
  if (trimmed) {
    return `👋 已为你锁定「${trimmed}」。有问题随时问我，或点下方活动名切换场次。`;
  }
  return '👋 我是你的 AI 智能助手，帮你发现活动、规划出行。点下方活动名绑定场次。';
}
