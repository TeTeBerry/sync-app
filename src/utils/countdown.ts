import type { CountdownPart } from '../types/countdown';

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export const EMPTY_COUNTDOWN_PARTS: CountdownPart[] = [
  { value: '--', unit: 'd' },
  { value: '--', unit: 'h' },
  { value: '--', unit: 'm' },
  { value: '--', unit: 's', accent: true },
];

export function getCountdownParts(target: Date, now = new Date()): CountdownPart[] {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { value: pad2(days), unit: 'd' },
    { value: pad2(hours), unit: 'h' },
    { value: pad2(minutes), unit: 'm' },
    { value: pad2(seconds), unit: 's', accent: true },
  ];
}
