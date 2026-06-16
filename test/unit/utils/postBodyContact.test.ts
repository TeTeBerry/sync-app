import { describe, expect, it } from 'vitest';
import { stripPostBodyContact } from '@/utils/postBodyContact';

describe('stripPostBodyContact', () => {
  it('removes contact and keeps trailing note from buddy post body', () => {
    expect(
      stripPostBodyContact(
        '组队，6.13-6.14，上海，2人，联系方式：wx_sync_team，女生优先',
      ),
    ).toBe('组队，6.13-6.14，上海，2人，女生优先');
  });

  it('removes contact without trailing note', () => {
    expect(
      stripPostBodyContact('组队，6.13-6.14，上海，1人，联系方式：13800138000'),
    ).toBe('组队，6.13-6.14，上海，1人');
  });

  it('returns full body when no contact marker exists', () => {
    expect(stripPostBodyContact('还有人一起吗，上海出发组队')).toBe(
      '还有人一起吗，上海出发组队',
    );
  });
});
