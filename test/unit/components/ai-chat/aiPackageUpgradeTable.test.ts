import { describe, expect, it } from 'vitest';
import { MOCK_PACKAGE_CATALOG } from '@/components/profile/profilePackageData';
import { buildAiPackageCompareRows } from '@/components/ai-chat/aiPackageUpgradeTable';

describe('buildAiPackageCompareRows', () => {
  it('builds three comparison rows without voucher/exposure', () => {
    const rows = buildAiPackageCompareRows(MOCK_PACKAGE_CATALOG.tiers);
    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.id)).toEqual(['contactUnlock', 'mapDays', 'postPin']);
    expect(rows[0].values.pro).toBe('5 次');
    expect(rows[0].values.ultra).toBe('不限次');
    expect(rows[2].values.pro).toBe('—');
    expect(rows[2].values.pro_plus).toBe('×1 次');
  });
});
