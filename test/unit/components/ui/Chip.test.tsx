import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/Chip.scss', () => ({}));

vi.mock('@tarojs/components', () => ({
  View: ({
    children,
    className,
    onClick,
  }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  ),
  Text: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <span className={className}>{children}</span>
  ),
}));

import { Chip } from '@/components/ui/Chip';

describe('Chip', () => {
  it('renders inactive chip classes', () => {
    const html = renderToString(
      <Chip label="Asia" active={false} onClick={() => undefined} />,
    );
    expect(html).toContain('s-chip');
    expect(html).not.toContain('s-chip--active');
  });

  it('renders active modifier', () => {
    const html = renderToString(<Chip label="Asia" active onClick={() => undefined} />);
    expect(html).toContain('s-chip--active');
    expect(html).toContain('s-chip__label--active');
  });

  it('renders small size modifier', () => {
    const html = renderToString(
      <Chip label="Asia" size="sm" onClick={() => undefined} />,
    );
    expect(html).toContain('s-chip--sm');
  });
});
