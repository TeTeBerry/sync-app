import React from "react";
import {
  Check,
  CircleCheck,
  Clock,
  Flame,
  Heart,
  MessageCircle,
  MessageSquare,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from "lucide-react-taro";
import { ContentTypeBadge } from "../../../components/ContentTypeBadge";
import { ProfileCollapsibleSection } from "../../../components/profile/ProfileCollapsibleSection";
import type { ProfilePostItem } from "../../../types/backend";
import { POST_ACTION_ICON_COLOR } from "../../../utils/postActionColors";
import { Button, Text, Textarea, View } from "@tarojs/components";

const POST_BODY_MAX = 200;
const PROFILE_POST_STAT_ICON_SIZE = 14;
const PROFILE_POST_ACTION_ICON_SIZE = 16;
const PROFILE_POST_ACTION_COMPLETE_COLOR = "#22c55e";
const PROFILE_POST_ACTION_EDIT_COLOR = "#4cc9f0";
const PROFILE_POST_ACTION_DELETE_COLOR = "#ff6467";

export type ProfilePostEditDraft = {
  body: string;
  status: "招募中" | "已组队";
};

export type ProfilePostsSectionProps = {
  items: ProfilePostItem[];
  /** `list` renders all items without collapsible chrome (detail sub-page). */
  mode?: "collapsible" | "list";
  editingPostId?: string | null;
  editDraft?: ProfilePostEditDraft | null;
  onSelect?: (item: ProfilePostItem) => void;
  onComplete?: (item: ProfilePostItem) => void;
  onEdit?: (item: ProfilePostItem) => void;
  onDelete?: (item: ProfilePostItem) => void;
  onEditDraftChange?: (draft: ProfilePostEditDraft) => void;
  onSaveEdit?: (item: ProfilePostItem) => void;
  onCancelEdit?: () => void;
};

function isPostEditDirty(item: ProfilePostItem, draft: ProfilePostEditDraft): boolean {
  const statusMatches =
    draft.status === "已组队" ? item.status === "已组队" : item.status === "招募中";
  return draft.body !== item.content || !statusMatches;
}

function renderPostItems(
  pageItems: ProfilePostItem[],
  props: Omit<ProfilePostsSectionProps, "items" | "mode">,
) {
  const {
    editingPostId = null,
    editDraft = null,
    onSelect,
    onComplete,
    onEdit,
    onDelete,
    onEditDraftChange,
    onSaveEdit,
    onCancelEdit,
  } = props;

  return pageItems.map((item) => {
    const isEditing = editingPostId === item.id;
    const draft = isEditing ? editDraft : null;
    const charCount = draft?.body.length ?? 0;
    const charProgress = Math.min(charCount / POST_BODY_MAX, 1);
    const isDirty = isEditing && draft ? isPostEditDirty(item, draft) : false;

    return (
      <View
        key={item.id}
        className={`s-profile-post s-profile-post--clickable${isEditing ? " s-profile-post--editing" : ""}`}
        role="button"
        onClick={() => onSelect?.(item)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect?.(item);
        }}>
        <View className="s-profile-post__head">
          <Text className="s-profile-post__title">
            <Text className="s-profile-post__title-dot" />
            {item.title}
          </Text>
          {item.status === "招募中" ? (
            <Text className="s-profile-post__status s-profile-post__status--recruiting">
              招募中
            </Text>
          ) : item.status === "已组队" ? (
            <Text className="s-profile-post__status s-profile-post__status--grouped">
              已组队
            </Text>
          ) : null}
        </View>

        <Text className="s-profile-post__content">{item.content}</Text>

        <ContentTypeBadge types={item.contentTypes} />

        <View className="s-profile-post__footer">
          <View className="s-profile-post__stats">
            <View className="s-profile-post__stat">
              <View className="s-profile-post__stat-icon">
                <Heart size={PROFILE_POST_STAT_ICON_SIZE} color={POST_ACTION_ICON_COLOR} />
              </View>
              <Text>{item.likes}</Text>
            </View>
            <View className="s-profile-post__stat">
              <View className="s-profile-post__stat-icon">
                <MessageCircle size={PROFILE_POST_STAT_ICON_SIZE} color={POST_ACTION_ICON_COLOR} />
              </View>
              <Text>{item.comments}</Text>
            </View>
            <View className="s-profile-post__stat">
              <View className="s-profile-post__stat-icon">
                <Clock size={PROFILE_POST_STAT_ICON_SIZE} color={POST_ACTION_ICON_COLOR} />
              </View>
              <Text>{item.date}</Text>
            </View>
          </View>

          <View className="s-profile-post__actions">
            {item.status === "招募中" ? (
              <Button
                className="s-profile-post__action s-profile-post__action--complete"
                aria-label="标记已组队"
                onClick={(event) => {
                  event.stopPropagation();
                  onComplete?.(item);
                }}>
                <View className="s-profile-post__action-icon">
                  <CircleCheck
                    size={PROFILE_POST_ACTION_ICON_SIZE}
                    color={PROFILE_POST_ACTION_COMPLETE_COLOR}
                  />
                </View>
              </Button>
            ) : null}
            <Button
              className="s-profile-post__action s-profile-post__action--edit"
              aria-label="编辑"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(item);
              }}>
              <View className="s-profile-post__action-icon">
                <Pencil size={PROFILE_POST_ACTION_ICON_SIZE} color={PROFILE_POST_ACTION_EDIT_COLOR} />
              </View>
            </Button>
            <Button
              className="s-profile-post__action s-profile-post__action--delete"
              aria-label="删除"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(item);
              }}>
              <View className="s-profile-post__action-icon">
                <Trash2
                  size={PROFILE_POST_ACTION_ICON_SIZE}
                  color={PROFILE_POST_ACTION_DELETE_COLOR}
                />
              </View>
            </Button>
          </View>
        </View>

        {isEditing && draft ? (
          <View className="s-profile-post-edit" onClick={(event) => event.stopPropagation()}>
            <View className="s-profile-post-edit__header">
              <View className="s-profile-post-edit__label">
                <View className="s-profile-post-edit__label-icon">
                  <Pencil size={14} color={PROFILE_POST_ACTION_EDIT_COLOR} />
                </View>
                <Text>编辑帖子</Text>
              </View>
              <Text className="s-profile-post-edit__event">{item.title}</Text>
            </View>

            <View className="s-profile-post-edit__field">
              <View className="s-profile-post-edit__textarea-wrap">
                <Textarea
                  className="s-profile-post-edit__textarea"
                  value={draft.body}
                  maxlength={POST_BODY_MAX}
                  onInput={(event) => {
                    onEditDraftChange?.({
                      ...draft,
                      body: event.detail.value.slice(0, POST_BODY_MAX),
                    });
                  }}
                />
                <Text className="s-profile-post-edit__counter">
                  {`${charCount} / ${POST_BODY_MAX}`}
                </Text>
              </View>
              <View className="s-profile-post-edit__progress">
                <Text
                  className="s-profile-post-edit__progress-fill"
                  style={{ width: `${charProgress * 100}%` }}
                />
              </View>
            </View>

            <Text className="s-profile-post-edit__status-label">帖子状态</Text>
            <View className="s-profile-post-edit__status-row">
              <Button
                className={`s-profile-post-edit__status-btn${
                  draft.status === "招募中"
                    ? " s-profile-post-edit__status-btn--active-recruiting"
                    : ""
                }`}
                onClick={() => onEditDraftChange?.({ ...draft, status: "招募中" })}>
                <Flame size={16} />
                <Text>招募中</Text>
                {draft.status === "招募中" ? (
                  <Text className="s-profile-post-edit__status-dot" />
                ) : null}
              </Button>
              <Button
                className={`s-profile-post-edit__status-btn${
                  draft.status === "已组队"
                    ? " s-profile-post-edit__status-btn--active-grouped"
                    : ""
                }`}
                onClick={() => onEditDraftChange?.({ ...draft, status: "已组队" })}>
                <CircleCheck size={16} />
                <Text>已组队</Text>
                {draft.status === "已组队" ? (
                  <Sparkles size={14} className="s-profile-post-edit__status-sparkle" />
                ) : null}
              </Button>
            </View>

            {isDirty ? (
              <Text className="s-profile-post-edit__dirty">
                <Text className="s-profile-post-edit__dirty-dot" />
                内容已修改，记得保存
              </Text>
            ) : null}

            <View className="s-profile-post-edit__actions">
              <Button className="s-profile-post-edit__save" onClick={() => onSaveEdit?.(item)}>
                <Check size={16} />
                保存修改
              </Button>
              <Button className="s-profile-post-edit__cancel" onClick={() => onCancelEdit?.()}>
                <X size={14} />
                取消
              </Button>
            </View>
          </View>
        ) : null}
      </View>
    );
  });
}

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  items,
  mode = "collapsible",
  editingPostId = null,
  editDraft = null,
  onSelect,
  onComplete,
  onEdit,
  onDelete,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  const postProps = {
    editingPostId,
    editDraft,
    onSelect,
    onComplete,
    onEdit,
    onDelete,
    onEditDraftChange,
    onSaveEdit,
    onCancelEdit,
  };

  if (mode === "list") {
    return (
      <View className="s-profile-section__body s-profile-section__body--standalone">
        {items.length === 0 ? (
          <View className="s-profile-section__empty">
            <View className="s-profile-section__empty-icon s-profile-section__empty-icon--posts">
              <MessageSquare size={22} />
            </View>
            <Text className="s-profile-section__empty-title">还没有发布帖子</Text>
            <Text className="s-profile-section__empty-hint">在活动详情通过 AI 助手发布组队帖</Text>
          </View>
        ) : (
          renderPostItems(items, postProps)
        )}
      </View>
    );
  }

  return (
  <ProfileCollapsibleSection
    variant="posts"
    icon={<MessageSquare size={14} />}
    title="我的帖子"
    items={items}
    renderEmpty={() => (
      <View className="s-profile-section__empty">
        <View className="s-profile-section__empty-icon s-profile-section__empty-icon--posts">
          <MessageSquare size={22} />
        </View>
        <Text className="s-profile-section__empty-title">还没有发布帖子</Text>
        <Text className="s-profile-section__empty-hint">在活动详情通过 AI 助手发布组队帖</Text>
      </View>
    )}>
    {(pageItems) => renderPostItems(pageItems, postProps)}
  </ProfileCollapsibleSection>
  );
};

export default ProfilePostsSection;
