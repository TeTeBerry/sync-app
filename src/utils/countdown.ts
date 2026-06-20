import type { CountdownPart } from '../types/countdown';

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export const EMPTY_COUNTDOWN_PARTS: CountdownPart[] = [
  { value: '--', unit: 'countdown.days' },
  { value: '--', unit: 'countdown.hours' },
  { value: '--', unit: 'countdown.minutes', accent: true },
  { value: '--', unit: 'countdown.seconds' },
];

export function getCountdownParts(target: Date, now = new Date()): CountdownPart[] {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 如果总时长超过1天，显示天、小时、分钟
  if (days > 0) {
    return [
      { value: pad2(days), unit: 'countdown.days' },
      { value: pad2(hours), unit: 'countdown.hours' },
      { value: pad2(minutes), unit: 'countdown.minutes', accent: true },
    ];
  }

  // 否则显示小时、分钟、秒
  return [
    { value: pad2(hours), unit: 'countdown.hours' },
    { value: pad2(minutes), unit: 'countdown.minutes', accent: true },
    { value: pad2(seconds), unit: 'countdown.seconds' },
  ];
}
