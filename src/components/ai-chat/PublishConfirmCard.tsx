import {
  ContentTypeBadge,
  filterContentTypeTags,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from '../post';
import { inferIntentTagsFromText } from '../../utils/inferIntentTags';
import {
  PUBLISH_CONFIRM_MARKER,
  type PublishConfirmPayload,
} from '../../utils/parsePublishConfirmMessage';
import { Image, Text, View } from '@tarojs/components';

const HASHTAG_TAG_RE = /#([^\s#]+)/g;

function extractDisplayTags(body: string, contentTypeKeys: string[]): string[] {
  const tags: string[] = [];
  for (const match of body.matchAll(HASHTAG_TAG_RE)) {
    tags.push(`#${match[1]}`);
  }
  return filterContentTypeTags(tags, contentTypeKeys);
}

export function PublishConfirmCard({
  payload,
  userAvatar,
  userName,
}: {
  payload: PublishConfirmPayload;
  userAvatar?: string;
  userName: string;
}) {
  const contentTypeKeys = mergePostContentTypes(undefined, {
    body: payload.draftBody,
    tags: payload.draftTags,
  });
  const bodyText = stripContentTypeHashtags(payload.draftBody);
  const inferredTags =
    payload.draftTags.length > 0
      ? payload.draftTags
      : inferIntentTagsFromText(payload.draftBody);
  const displayTags = filterContentTypeTags(
    inferredTags.length
      ? inferredTags
      : extractDisplayTags(payload.draftBody, contentTypeKeys),
    contentTypeKeys,
  );

  return (
    <View className="s-publish-confirm">
      <Text className="s-publish-confirm__title">{PUBLISH_CONFIRM_MARKER}</Text>
      <Text className="s-publish-confirm__context">{`「${payload.activityLabel}」帖子预览`}</Text>

      <View className="s-publish-confirm__preview">
        <View className="s-publish-confirm__preview-header">
          {userAvatar ? (
            <Image
              className="s-publish-confirm__avatar"
              src={userAvatar}
              mode="aspectFill"
            />
          ) : (
            <Text className="s-publish-confirm__avatar s-publish-confirm__avatar--fallback">
              {userName.slice(0, 1)}
            </Text>
          )}
          <View className="s-publish-confirm__author">
            <Text className="s-publish-confirm__author-name">{userName}</Text>
            <Text className="s-publish-confirm__author-meta">待发布 · 草稿</Text>
          </View>
        </View>

        <Text className="s-publish-confirm__event-title">{payload.activityLabel}</Text>

        {bodyText ? <Text className="s-publish-confirm__body">{bodyText}</Text> : null}

        <ContentTypeBadge types={contentTypeKeys} />

        {displayTags.length ? (
          <View className="s-publish-confirm__tags">
            {displayTags.map((tag) => (
              <Text key={tag} className="s-publish-confirm__tag">
                {tag}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <Text className="s-publish-confirm__hint">{payload.footerHint}</Text>
    </View>
  );
}
