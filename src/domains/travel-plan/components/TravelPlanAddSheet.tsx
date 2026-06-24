import './TravelPlanAddSheet.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  Car,
  CircleCheck,
  ImageIcon,
  ScanLine,
  Sparkles,
  Ticket,
  Utensils,
  X,
} from '@/components/icons';
import { recognizeTravelPlanReceipt } from '@/api/sync/travelPlan';
import { Button, cn } from '@/components/ui';
import { isLiveApi } from '@/constants/api';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { ApiError } from '@/utils/apiClient';
import { ChatImageTooLargeError, pickAndCompressChatImage } from '@/utils/chatImage';
import { buildTravelPlanReceiptImageRef } from '../utils/buildTravelPlanReceiptImageRef';
import {
  createEmptyTravelPlanAddForm,
  sortTravelPlanAddFormValues,
  type TravelPlanAddFormCategory,
  type TravelPlanAddFormValues,
} from '../utils/travelPlanAddForm';
import {
  recognizedTravelPlanFormsToAddFormValues,
  resolveRecognizedTravelPlanForms,
} from '../utils/travelPlanReceiptRecognize';
import { shouldMergeTransportForms } from '../utils/travelPlanTransportBills';
import Taro from '@tarojs/taro';
import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { TravelPlanAddSheetSegment } from './TravelPlanAddSheetSegment';
import { ScrollView, Text, View } from '@tarojs/components';

/** Lucide `color` must be a concrete value — CSS variables are invalid in WeChat. */
const THEME_PRIMARY = '#ff0066';

const TYPE_OPTIONS: Array<{
  id: TravelPlanAddFormCategory;
  label: string;
  Icon: typeof Car;
}> = [
  { id: 'transport', label: '交通', Icon: Car },
  { id: 'hotel', label: '住宿', Icon: BedDouble },
  { id: 'dining', label: '餐饮', Icon: Utensils },
  { id: 'event', label: '其他', Icon: Ticket },
];

type OcrStatus = 'idle' | 'loading' | 'success';

export type TravelPlanAddSheetProps = {
  open: boolean;
  activityLegacyId: number | null;
  onClose: () => void;
  onSubmit: (values: TravelPlanAddFormValues[]) => void;
};

export function TravelPlanAddSheet({
  open,
  activityLegacyId,
  onClose,
  onSubmit,
}: TravelPlanAddSheetProps) {
  useOverlayLock(open);

  const [category, setCategory] = useState<TravelPlanAddFormCategory>('hotel');
  const [formSegments, setFormSegments] = useState<TravelPlanAddFormValues[]>([
    createEmptyTravelPlanAddForm(),
  ]);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrMessage, setOcrMessage] = useState('');

  useEffect(() => {
    if (open) {
      setCategory('hotel');
      setFormSegments([createEmptyTravelPlanAddForm('hotel')]);
      setOcrStatus('idle');
      setOcrMessage('');
    }
  }, [open]);

  const canSubmit = useMemo(
    () => formSegments.every((segment) => segment.title.trim().length > 0),
    [formSegments],
  );

  const resetOcrState = useCallback(() => {
    setOcrStatus('idle');
    setOcrMessage('');
  }, []);

  const patchFormSegment = useCallback(
    (index: number, patch: Partial<TravelPlanAddFormValues>) => {
      setFormSegments((prev) =>
        prev.map((segment, segmentIndex) =>
          segmentIndex === index ? { ...segment, ...patch } : segment,
        ),
      );
    },
    [],
  );

  const removeFormSegment = useCallback(
    (index: number) => {
      setFormSegments((prev) => {
        if (prev.length <= 1) {
          return [createEmptyTravelPlanAddForm(category)];
        }
        const next = prev.filter((_, segmentIndex) => segmentIndex !== index);
        return next.length > 0 ? next : [createEmptyTravelPlanAddForm(category)];
      });
    },
    [category],
  );

  const batchMode = formSegments.length > 1;

  const handleCategoryChange = useCallback(
    (nextCategory: TravelPlanAddFormCategory) => {
      setCategory(nextCategory);
      setFormSegments((prev) => {
        if (prev.length > 1) {
          return prev;
        }
        return [createEmptyTravelPlanAddForm(nextCategory)];
      });
      resetOcrState();
    },
    [resetOcrState],
  );

  const handleUploadScreenshot = useCallback(() => {
    if (ocrStatus === 'loading') {
      return;
    }

    void (async () => {
      if (!activityLegacyId) {
        void Taro.showToast({ title: '活动信息加载中', icon: 'none' });
        return;
      }

      const filePath = await pickAndCompressChatImage();
      if (!filePath) {
        return;
      }

      setOcrStatus('loading');
      setOcrMessage('');
      showThemedLoading({ title: '识别中…', mask: true });

      try {
        if (!isLiveApi()) {
          resetOcrState();
          void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
          return;
        }

        const imageRef = await buildTravelPlanReceiptImageRef(filePath);
        const result = await recognizeTravelPlanReceipt(activityLegacyId, {
          category,
          image: imageRef,
        });

        const recognizedForms = resolveRecognizedTravelPlanForms(result);
        if (result.filled && recognizedForms.length > 0) {
          setFormSegments(
            recognizedTravelPlanFormsToAddFormValues(category, recognizedForms),
          );
          setOcrStatus('success');
          setOcrMessage(
            result.message ??
              (category === 'dining' && recognizedForms.length > 1
                ? `AI 识别完成，已识别 ${recognizedForms.length} 笔账单`
                : category === 'event' && recognizedForms.length > 1
                  ? `AI 识别完成，已识别 ${recognizedForms.length} 笔记录`
                  : category === 'transport' &&
                      recognizedForms.length > 1 &&
                      shouldMergeTransportForms(
                        recognizedTravelPlanFormsToAddFormValues(
                          category,
                          recognizedForms,
                        ),
                      )
                    ? `AI 识别完成，已识别 ${recognizedForms.length} 笔打车记录`
                    : recognizedForms.length > 1
                      ? `AI 识别完成，已拆分为 ${recognizedForms.length} 段单程`
                      : 'AI 识别完成，已自动填入'),
          );
          return;
        }

        resetOcrState();
        void Taro.showToast({
          title: result.message ?? '未能识别，请手动填写',
          icon: 'none',
        });
      } catch (error) {
        resetOcrState();
        const message =
          error instanceof ChatImageTooLargeError
            ? '图片过大，请换一张更小的截图'
            : error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : '识别失败，请稍后重试';
        void Taro.showToast({ title: message, icon: 'none' });
      } finally {
        hideThemedLoading();
      }
    })();
  }, [activityLegacyId, category, ocrStatus, resetOcrState]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      void Taro.showToast({
        title: formSegments.length > 1 ? '请填写每段标题' : '请填写标题',
        icon: 'none',
      });
      return;
    }
    onSubmit(sortTravelPlanAddFormValues(formSegments));
    onClose();
  }, [canSubmit, formSegments, onClose, onSubmit]);

  if (!open) {
    return null;
  }

  return (
    <View
      className="s-overlay s-overlay--sheet s-travel-plan-add-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-travel-plan-add-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="travel-plan-add-sheet-title"
      >
        <View className="s-travel-plan-add-sheet__handle" aria-hidden />

        <View className="s-travel-plan-add-sheet__top">
          <Text
            id="travel-plan-add-sheet-title"
            className="s-travel-plan-add-sheet__title"
          >
            添加行程节点
          </Text>
          <Button
            className="s-travel-plan-add-sheet__close"
            hoverClass="s-travel-plan-add-sheet__close--pressed"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-travel-plan-add-sheet__scroll s-scrollbar-none"
          style={{ flex: 1, height: 0, minHeight: 0 }}
        >
          <View className="s-travel-plan-add-sheet__body">
            <View
              className={cn(
                's-travel-plan-add-sheet__ocr',
                ocrStatus === 'success' && 's-travel-plan-add-sheet__ocr--success',
              )}
            >
              <View className="s-travel-plan-add-sheet__ocr-icon" aria-hidden>
                <ScanLine
                  size={20}
                  color={ocrStatus === 'success' ? '#30d158' : '#bf5af2'}
                />
              </View>
              <View className="s-travel-plan-add-sheet__ocr-copy">
                <Text className="s-travel-plan-add-sheet__ocr-title">截图识别</Text>
                <Text className="s-travel-plan-add-sheet__ocr-sub">
                  上传票务 / 订单截图，AI 自动填入信息
                </Text>
              </View>
              <Button
                className={cn(
                  's-travel-plan-add-sheet__ocr-btn',
                  ocrStatus === 'loading' &&
                    's-travel-plan-add-sheet__ocr-btn--loading',
                  ocrStatus === 'success' &&
                    's-travel-plan-add-sheet__ocr-btn--success',
                )}
                hoverClass={
                  ocrStatus === 'idle'
                    ? 's-travel-plan-add-sheet__ocr-btn--pressed'
                    : ''
                }
                disabled={ocrStatus === 'loading'}
                onClick={handleUploadScreenshot}
              >
                {ocrStatus === 'loading' ? (
                  <View
                    className="s-travel-plan-add-sheet__ocr-btn-spinner"
                    aria-hidden
                  />
                ) : ocrStatus === 'success' ? (
                  <CircleCheck size={14} color="#30d158" aria-hidden />
                ) : (
                  <ImageIcon size={14} color="#bf5af2" aria-hidden />
                )}
                <Text
                  className={cn(
                    's-travel-plan-add-sheet__ocr-btn-label',
                    ocrStatus === 'loading' &&
                      's-travel-plan-add-sheet__ocr-btn-label--loading',
                    ocrStatus === 'success' &&
                      's-travel-plan-add-sheet__ocr-btn-label--success',
                  )}
                >
                  {ocrStatus === 'loading'
                    ? '识别中'
                    : ocrStatus === 'success'
                      ? '已填入'
                      : '上传截图'}
                </Text>
              </Button>
            </View>
            {ocrStatus === 'success' && ocrMessage ? (
              <View className="s-travel-plan-add-sheet__ocr-hint">
                <Sparkles size={14} color="#30d158" aria-hidden />
                <View className="s-travel-plan-add-sheet__ocr-hint-copy">
                  <Text className="s-travel-plan-add-sheet__ocr-hint-label">
                    {ocrMessage}
                  </Text>
                  {batchMode ? (
                    <Text className="s-travel-plan-add-sheet__ocr-hint-sub">
                      已填入 {formSegments.length} 项，可修改每条类型并向下滚动编辑
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Text className="s-travel-plan-add-sheet__label">
              {batchMode ? '默认识别类型' : '类型'}
            </Text>
            <View className="s-travel-plan-add-sheet__types">
              {TYPE_OPTIONS.map(({ id, label, Icon }) => {
                const active = category === id;
                return (
                  <Button
                    key={id}
                    className={cn(
                      's-travel-plan-add-sheet__type',
                      active && 's-travel-plan-add-sheet__type--active',
                    )}
                    hoverClass="s-travel-plan-add-sheet__type--pressed"
                    onClick={() => handleCategoryChange(id)}
                  >
                    <Icon
                      size={20}
                      color={active ? THEME_PRIMARY : '#8e8e93'}
                      aria-hidden
                    />
                    <Text
                      className={cn(
                        's-travel-plan-add-sheet__type-label',
                        active && 's-travel-plan-add-sheet__type-label--active',
                      )}
                    >
                      {label}
                    </Text>
                  </Button>
                );
              })}
            </View>

            <View className="s-travel-plan-add-sheet__segments">
              {formSegments.map((segment, index) => (
                <TravelPlanAddSheetSegment
                  key={`segment-${index}`}
                  index={index}
                  total={formSegments.length}
                  form={segment}
                  sheetOpen={open}
                  onPatch={(patch) => patchFormSegment(index, patch)}
                  onRemove={batchMode ? () => removeFormSegment(index) : undefined}
                  batchMode={batchMode}
                />
              ))}
            </View>

            <View className="s-travel-plan-add-sheet__submit-wrap">
              <Button
                className={cn(
                  's-travel-plan-add-sheet__submit',
                  !canSubmit && 's-travel-plan-add-sheet__submit--disabled',
                )}
                disabled={!canSubmit}
                hoverClass={canSubmit ? 's-travel-plan-add-sheet__submit--pressed' : ''}
                onClick={handleSubmit}
              >
                <Text className="s-travel-plan-add-sheet__submit-label">
                  {batchMode ? `保存 ${formSegments.length} 项` : '保存行程'}
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
