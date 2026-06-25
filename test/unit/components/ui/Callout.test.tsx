import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/Callout.scss', () => ({}));

vi.mock('@tarojs/components', () => ({
  View: ({
    children,
    className,
    role,
  }: React.PropsWithChildren<{ className?: string; role?: string }>) => (
    <div className={className} role={role}>
      {children}
    </div>
  ),
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

import { Callout } from '@/components/ui/Callout';

describe('Callout', () => {
  it('renders stale variant and status role by default', () => {
    const html = renderToString(
      <Callout variant="stale">Offline cache from 06/25</Callout>,
    );
    expect(html).toContain('s-callout--stale');
    expect(html).toContain('role="status"');
    expect(html).toContain('Offline cache from 06/25');
  });

  it('renders warning variant with alert role', () => {
    const html = renderToString(
      <Callout variant="warning" role="alert" title="Heads up">
        Please review
      </Callout>,
    );
    expect(html).toContain('s-callout--warning');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Heads up');
  });
});
