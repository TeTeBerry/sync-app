export function buildAiAssistantWelcomeText(activityTitle?: string): string {
  const trimmed = activityTitle?.trim();
  if (trimmed) {
    return `👋 已为你锁定「${trimmed}」。查阵容、出行准备请看上方「本场计划」，有问题直接问我。`;
  }
  return '👋 我是你的 AI 智能助手。点下方「选一场音乐节」绑定场次，或问我最近有什么活动。';
}
