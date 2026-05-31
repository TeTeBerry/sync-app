/** Matches backend `PUBLISH_CONFIRM_PROMPT_MARKER`. */
export const PUBLISH_CONFIRM_MARKER = "【发布确认】";

/** Matches backend `PUBLISH_CONFIRM_TAGS_MARKER`. */
export const PUBLISH_CONFIRM_TAGS_MARKER = "【标签】";

export type PublishConfirmPayload = {
  activityLabel: string;
  draftBody: string;
  draftTags: string[];
  footerHint: string;
};

/** Parse assistant publish-confirm replies built by `buildPublishConfirmReply`. */
export function parsePublishConfirmMessage(text: string): PublishConfirmPayload | null {
  if (!text.includes(PUBLISH_CONFIRM_MARKER)) {
    return null;
  }

  const lines = text.split("\n");
  const markerIndex = lines.findIndex((line) => line.includes(PUBLISH_CONFIRM_MARKER));
  if (markerIndex < 0) {
    return null;
  }

  let index = markerIndex + 1;
  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  const activityLine = lines[index]?.trim() ?? "";
  const activityMatch = activityLine.match(/^「(.+)」帖子预览：$/);
  const parsedActivityLabel = activityLine.replace(/帖子预览：$/, "").replace(/^「|」$/g, "");
  const activityLabel = activityMatch?.[1] ?? (parsedActivityLabel || "活动");
  index += 1;

  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  const bodyLines: string[] = [];
  const draftTags: string[] = [];
  let footerHint = "点「确认发布」直接发，想改什么直接说～";

  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed.startsWith(PUBLISH_CONFIRM_TAGS_MARKER)) {
      const payload = trimmed.slice(PUBLISH_CONFIRM_TAGS_MARKER.length).trim();
      for (const token of payload.split(/\s+/)) {
        const tag = token.trim();
        if (!tag) continue;
        draftTags.push(tag.startsWith("#") ? tag : `#${tag}`);
      }
      continue;
    }
    if (/^点「/.test(trimmed) || /^想改/.test(trimmed)) {
      footerHint = trimmed;
      break;
    }
    bodyLines.push(line);
  }

  while (bodyLines.length && !bodyLines[bodyLines.length - 1].trim()) {
    bodyLines.pop();
  }

  const draftBody = bodyLines.join("\n").trim();
  if (!draftBody) {
    return null;
  }

  return { activityLabel, draftBody, draftTags, footerHint };
}
