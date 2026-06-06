import { describe, expect, it } from 'vitest';
import {
  PUBLISH_CONFIRM_MARKER,
  PUBLISH_CONFIRM_TAGS_MARKER,
  parsePublishConfirmMessage,
} from '@/utils/parsePublishConfirmMessage';

function buildSampleReply(params: {
  activityLabel: string;
  draftBody: string;
  draftTags?: string[];
}): string {
  const tagLine = params.draftTags?.length
    ? `${PUBLISH_CONFIRM_TAGS_MARKER}${params.draftTags.join(' ')}`
    : '';

  return [
    PUBLISH_CONFIRM_MARKER,
    `「${params.activityLabel}」帖子预览：`,
    '',
    params.draftBody,
    ...(tagLine ? ['', tagLine] : []),
    '',
    '点「确认发布」直接发，想改什么直接说～',
  ].join('\n');
}

describe('parsePublishConfirmMessage', () => {
  it('returns null when marker is absent', () => {
    expect(parsePublishConfirmMessage('普通回复')).toBeNull();
  });

  it('parses activity label, draft body, and tags', () => {
    const text = buildSampleReply({
      activityLabel: '风暴电音节',
      draftBody: '13A区有姐妹吗',
      draftTags: ['13号A区', '#女生'],
    });

    expect(parsePublishConfirmMessage(text)).toEqual({
      activityLabel: '风暴电音节',
      draftBody: '13A区有姐妹吗',
      draftTags: ['#13号A区', '#女生'],
      footerHint: '点「确认发布」直接发，想改什么直接说～',
    });
  });

  it('returns null when draft body is empty', () => {
    const text = buildSampleReply({
      activityLabel: '风暴电音节',
      draftBody: '   ',
    });
    expect(parsePublishConfirmMessage(text)).toBeNull();
  });

  it('preserves multiline draft body', () => {
    const text = buildSampleReply({
      activityLabel: 'ASOT',
      draftBody: '第一行\n第二行',
    });

    expect(parsePublishConfirmMessage(text)?.draftBody).toBe('第一行\n第二行');
  });
});
