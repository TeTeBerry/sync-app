import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/legal/LegalConsentRow.scss', () => ({}));

vi.mock('@/utils/legalRoute', () => ({
  goLegalDocument: vi.fn(),
}));

vi.mock('@tarojs/components', () => ({
  View: ({
    children,
    className,
    onTap,
  }: React.PropsWithChildren<{ className?: string; onTap?: () => void }>) => (
    <div className={className} onClick={onTap}>
      {children}
    </div>
  ),
  Text: ({
    children,
    className,
    onClick,
  }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
    <span className={className} onClick={onClick}>
      {children}
    </span>
  ),
}));

import { LegalConsentRow } from '@/components/legal/LegalConsentRow';

describe('LegalConsentRow', () => {
  it('renders community-guidelines link copy', () => {
    const html = renderToString(
      <LegalConsentRow checked={false} onCheckedChange={() => undefined} />,
    );

    expect(html).toContain('《社区规范》');
    expect(html).toContain('《用户服务协议》');
    expect(html).toContain('《隐私政策》');
  });
});
