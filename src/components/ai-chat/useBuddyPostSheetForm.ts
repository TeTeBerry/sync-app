import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
} from '../../types/buddyPost';
import type { RecruitUnityTagId } from '@sync/partner-contracts';
import { MAX_RECRUIT_UNITY_TAGS } from '@sync/partner-contracts';
import { defaultBuddyPostForm } from '../../utils/buddyPostForm';

const NOTE_MAX_LENGTH = 120;

type UseBuddyPostSheetFormOptions = {
  open: boolean;
  activityDate?: string;
  initialValues?: AiBuddyPostFormValues | null;
  showSyncToFeedOption: boolean;
  onSubmit: (values: AiBuddyPostSubmitPayload) => void | Promise<void>;
};

export function useBuddyPostSheetForm({
  open,
  activityDate,
  initialValues,
  showSyncToFeedOption,
  onSubmit,
}: UseBuddyPostSheetFormOptions) {
  const defaults = useMemo(() => defaultBuddyPostForm(activityDate), [activityDate]);

  const [scrollTop, setScrollTop] = useState(0);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [location, setLocation] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [note, setNote] = useState('');
  const [recruitUnityTags, setRecruitUnityTags] = useState<RecruitUnityTagId[]>([]);
  const [syncToPostList, setSyncToPostList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }
    setScrollTop(0);
    setSyncToPostList(true);
    submittingRef.current = false;
    setIsSubmitting(false);
    const seed = initialValues ?? defaults;
    if (seed) {
      setDateStart(seed.dateStart);
      setDateEnd(seed.dateEnd);
      setLocation(seed.location);
      setHeadcount(seed.headcount);
      setNote(seed.note ?? '');
      setRecruitUnityTags(seed.recruitUnityTags ?? []);
      return;
    }
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateStart(iso);
    setDateEnd(iso);
    setLocation('');
    setHeadcount('');
    setNote('');
    setRecruitUnityTags([]);
  }, [defaults, initialValues, open]);

  const toggleRecruitUnityTag = useCallback((tagId: RecruitUnityTagId) => {
    setRecruitUnityTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (prev.length >= MAX_RECRUIT_UNITY_TAGS) return prev;
      return [...prev, tagId];
    });
  }, []);

  const canSubmit =
    Boolean(dateStart && dateEnd && location.trim() && headcount.trim()) &&
    dateEnd >= dateStart;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onSubmit({
          dateStart,
          dateEnd,
          location: location.trim(),
          headcount: headcount.trim(),
          tags: ['team'],
          recruitUnityTags,
          note: note.trim() || undefined,
          ...(showSyncToFeedOption ? { syncToPostList } : {}),
        }),
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    dateEnd,
    dateStart,
    headcount,
    location,
    note,
    recruitUnityTags,
    onSubmit,
    showSyncToFeedOption,
    syncToPostList,
  ]);

  return {
    scrollTop,
    dateStart,
    dateEnd,
    location,
    headcount,
    note,
    recruitUnityTags,
    syncToPostList,
    noteMaxLength: NOTE_MAX_LENGTH,
    canSubmit,
    isSubmitting,
    setDateStart,
    setDateEnd,
    setLocation,
    setHeadcount,
    setNote,
    setRecruitUnityTags,
    toggleRecruitUnityTag,
    setSyncToPostList,
    handleSubmit,
  };
}
