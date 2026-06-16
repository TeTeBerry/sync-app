import type { DjSoulProfile } from '../types';
import {
  getDjSoulProfile,
  getPersonalityMeta,
  type PersonalityTestCatalog,
} from '../personalityTestCatalog';
import {
  PERSONALITY_POSTER_DESIGN,
  PERSONALITY_POSTER_THEME,
} from '../constants/posterDesign';
import type { PersonalityTestResult, RaverPersonalityType } from '../types';

export type PersonalityPosterInput = {
  result: PersonalityTestResult;
  teaser: boolean;
  catalog: PersonalityTestCatalog;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string,
): void {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, PERSONALITY_POSTER_THEME.bgTop);
  gradient.addColorStop(0.45, PERSONALITY_POSTER_THEME.bgMid);
  gradient.addColorStop(1, PERSONALITY_POSTER_THEME.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.82, h * 0.12, 0, w * 0.82, h * 0.12, 320);
  glow.addColorStop(0, `${accent}44`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const glow2 = ctx.createRadialGradient(
    w * 0.15,
    h * 0.72,
    0,
    w * 0.15,
    h * 0.72,
    280,
  );
  glow2.addColorStop(0, PERSONALITY_POSTER_THEME.glowPurple);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h);
}

function drawSymbol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  profile: DjSoulProfile,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = profile.primaryColor;
  ctx.fillStyle = profile.secondaryColor;
  ctx.lineWidth = size * 0.06;

  switch (profile.visualSymbol) {
    case 'plus': {
      const arm = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
      ctx.stroke();
      break;
    }
    case 'sawTeeth': {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const x = cx - size * 0.35 + i * (size * 0.12);
        const y = cy + (i % 2 === 0 ? -size * 0.2 : size * 0.2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case 'waves': {
      ctx.beginPath();
      for (let x = -size * 0.4; x <= size * 0.4; x += 8) {
        const y = cy + Math.sin(x / 18) * size * 0.12;
        if (x === -size * 0.4) ctx.moveTo(cx + x, y);
        else ctx.lineTo(cx + x, y);
      }
      ctx.stroke();
      break;
    }
    case 'wings': {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx - size * 0.4, cy - size * 0.35, cx - size * 0.45, cy);
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + size * 0.4, cy - size * 0.35, cx + size * 0.45, cy);
      ctx.stroke();
      break;
    }
    case 'orbits': {
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 0.32, size * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, size * 0.2, size * 0.35, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    default: {
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * size * 0.28;
        const y = cy + Math.sin(angle) * size * 0.14;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawPersonalityPoster(
  ctx: CanvasRenderingContext2D,
  input: PersonalityPosterInput,
): void {
  const { width: w, height: h } = PERSONALITY_POSTER_DESIGN;
  const { result, teaser, catalog } = input;
  const meta = getPersonalityMeta(catalog, result.score.primaryType);
  const soul = result.recommendations.soulMatch;
  const profile = getDjSoulProfile(catalog, soul.djId);

  drawBackground(ctx, w, h, meta.primaryColor);

  drawSymbol(ctx, w / 2, 420, 280, profile, 0.18);
  drawSymbol(ctx, w / 2, 420, 200, profile, 0.55);

  ctx.textAlign = 'center';
  ctx.fillStyle = PERSONALITY_POSTER_THEME.textSecondary;
  ctx.font = '500 32px sans-serif';
  ctx.fillText(`${meta.emoji} ${meta.label}`, w / 2, 620);

  ctx.fillStyle = PERSONALITY_POSTER_THEME.textPrimary;
  ctx.font = '800 44px sans-serif';
  ctx.fillText('我的本命 DJ 是', w / 2, 760);

  const maskY = 820;
  const maskH = 120;
  const maskX = 96;
  const maskW = w - 192;

  if (teaser) {
    const maskGrad = ctx.createLinearGradient(maskX, maskY, maskX + maskW, maskY);
    maskGrad.addColorStop(0, PERSONALITY_POSTER_THEME.maskGradient[0]);
    maskGrad.addColorStop(0.5, PERSONALITY_POSTER_THEME.maskGradient[1]);
    maskGrad.addColorStop(1, PERSONALITY_POSTER_THEME.maskGradient[2]);
    ctx.fillStyle = maskGrad;
    roundRect(ctx, maskX, maskY, maskW, maskH, 20);
    ctx.fill();
    ctx.fillStyle = '#71717a';
    ctx.font = '700 48px sans-serif';
    ctx.fillText('???', w / 2, maskY + 76);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, maskX, maskY, maskW, maskH, 20);
    ctx.fill();
    ctx.fillStyle = meta.primaryColor;
    ctx.font = '800 56px sans-serif';
    ctx.fillText(soul.djName, w / 2, maskY + 58);
    ctx.fillStyle = PERSONALITY_POSTER_THEME.textSecondary;
    ctx.font = '500 28px sans-serif';
    ctx.fillText(soul.genreLabel, w / 2, maskY + 100);
  }

  ctx.fillStyle = PERSONALITY_POSTER_THEME.textSecondary;
  ctx.font = '500 34px sans-serif';
  ctx.fillText('灵魂相似度', w / 2, 1020);

  ctx.fillStyle = teaser ? '#52525b' : meta.primaryColor;
  ctx.font = '800 88px sans-serif';
  ctx.fillText(teaser ? '？？%' : `${soul.soulSimilarity}%`, w / 2, 1120);

  const qrX = 120;
  const qrY = 1240;
  const qrSize = 160;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  ctx.fillStyle = '#111';
  ctx.font = '600 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('扫码测测你的', qrX + qrSize + 28, qrY + 64);
  ctx.fillText('本命 DJ', qrX + qrSize + 28, qrY + 104);

  ctx.textAlign = 'center';
  ctx.fillStyle = PERSONALITY_POSTER_THEME.textMuted;
  ctx.font = '500 26px sans-serif';
  ctx.fillText('#EDC2026  #我的本命DJ  #电音人格测试', w / 2, 1520);

  ctx.fillStyle = PERSONALITY_POSTER_THEME.brand;
  ctx.font = '600 28px sans-serif';
  ctx.fillText('SYNC · 电音人格测试', w / 2, 1580);
}

export function getPosterAccentColor(
  catalog: PersonalityTestCatalog,
  type: RaverPersonalityType,
): string {
  return getPersonalityMeta(catalog, type).primaryColor;
}
