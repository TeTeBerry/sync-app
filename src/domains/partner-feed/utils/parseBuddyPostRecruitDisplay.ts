export type BuddyPostRecruitDisplay = {
  recruitStatus: 'open' | 'full';
  slotsTotal?: number;
  slotsFilled?: number;
};

const FULL_KEYWORDS = /已满|招满|满员/;

function parseFraction(
  text: string,
): Pick<BuddyPostRecruitDisplay, 'slotsFilled' | 'slotsTotal'> | null {
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return null;
  }
  const filled = Number.parseInt(match[1], 10);
  const total = Number.parseInt(match[2], 10);
  if (!Number.isFinite(filled) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  return {
    slotsFilled: Math.min(Math.max(filled, 0), total),
    slotsTotal: total,
  };
}

function parseRangeHeadcount(
  text: string,
): Pick<BuddyPostRecruitDisplay, 'slotsTotal'> | null {
  const match = text.match(/(\d+)\s*[-~～]\s*(\d+)\s*人/);
  if (!match) {
    return null;
  }
  const upper = Number.parseInt(match[2], 10);
  if (!Number.isFinite(upper) || upper <= 0) {
    return null;
  }
  return { slotsTotal: upper };
}

function parseSimpleHeadcount(
  text: string,
): Pick<BuddyPostRecruitDisplay, 'slotsTotal'> | null {
  const match = text.match(/(\d+)\s*人/);
  if (!match) {
    return null;
  }
  const total = Number.parseInt(match[1], 10);
  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }
  return { slotsTotal: total };
}

export function parseBuddyPostRecruitDisplay(
  body?: string | null,
): BuddyPostRecruitDisplay {
  const text = body?.trim() ?? '';
  if (!text) {
    return { recruitStatus: 'open' };
  }

  const recruitStatus: BuddyPostRecruitDisplay['recruitStatus'] = FULL_KEYWORDS.test(
    text,
  )
    ? 'full'
    : 'open';

  const fraction = parseFraction(text);
  if (fraction) {
    return {
      recruitStatus,
      slotsFilled: fraction.slotsFilled,
      slotsTotal: fraction.slotsTotal,
    };
  }

  const range = parseRangeHeadcount(text);
  if (range) {
    return { recruitStatus, slotsTotal: range.slotsTotal };
  }

  const simple = parseSimpleHeadcount(text);
  if (simple) {
    return { recruitStatus, slotsTotal: simple.slotsTotal };
  }

  return { recruitStatus };
}

type BuddyPostRecruitSource = {
  body?: string | null;
  bodyPreview?: string | null;
  recruitStatus?: 'open' | 'full';
  slotsTotal?: number;
  slotsFilled?: number;
};

/** Prefer structured post fields; fall back to body parsing (US-Q2-16). */
export function resolveBuddyPostRecruitDisplay(
  post: BuddyPostRecruitSource,
): BuddyPostRecruitDisplay {
  const parsed = parseBuddyPostRecruitDisplay(
    post.bodyPreview?.trim() || post.body?.trim() || '',
  );

  return {
    recruitStatus: post.recruitStatus ?? parsed.recruitStatus,
    slotsTotal: post.slotsTotal ?? parsed.slotsTotal,
    slotsFilled: post.slotsFilled ?? parsed.slotsFilled,
  };
}
