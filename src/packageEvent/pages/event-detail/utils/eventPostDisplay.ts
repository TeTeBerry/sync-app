/** @handle 展示：Mia → @mia，Zara Chen → @zara.chen */
export function formatEventPostHandle(name?: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "@user";
  const slug = trimmed
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "");
  return `@${slug || "user"}`;
}

export function parseGroupProgressFromText(text: string): {
  current: number;
  total: number;
} | null {
  const match = text.match(/(\d{1,2})\s*[/／]\s*(\d{1,2})/);
  if (!match) return null;
  const current = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(current) || !Number.isFinite(total) || total < 1) {
    return null;
  }
  return {
    current: Math.min(Math.max(0, current), total),
    total: Math.min(total, 12),
  };
}
