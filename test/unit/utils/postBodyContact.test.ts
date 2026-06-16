import { describe, expect, it } from 'vitest';
import { splitPostBodyContact } from '@/utils/postBodyContact';

describe('splitPostBodyContact', () => {
  it('splits contact and trailing note from buddy post body', () => {
    expect(
      splitPostBodyContact(
        '组队、拼房，6.13-6.14，上海，2人，联系方式：wx_sync_team，女生优先',
      ),
    ).toEqual({
      publicBody: '组队、拼房，6.13-6.14，上海，2人，女生优先',
      contact: 'wx_sync_team',
    });
  });

  it('splits contact without trailing note', () => {
    expect(
      splitPostBodyContact('组队，6.13-6.14，上海，1人，联系方式：13800138000'),
    ).toEqual({
      publicBody: '组队，6.13-6.14，上海，1人',
      contact: '13800138000',
    });
  });

  it('returns full body when no contact marker exists', () => {
    expect(splitPostBodyContact('还有人一起吗，上海出发组队')).toEqual({
      publicBody: '还有人一起吗，上海出发组队',
    });
  });
});
