import type {
  RecognizeTravelPlanReceiptResult,
  TravelPlanReceiptRecognizeForm,
} from '../../../types/backend';
import {
  sortTravelPlanAddFormValues,
  type TravelPlanAddFormCategory,
  type TravelPlanAddFormValues,
} from './travelPlanAddForm';
import { parseTransportTimesFromText } from './travelPlanTransportTime';

export function travelPlanReceiptFormToAddFormValues(
  category: TravelPlanAddFormCategory,
  receipt: TravelPlanReceiptRecognizeForm,
): TravelPlanAddFormValues {
  const includeTimes = category !== 'hotel';
  const parsedTransportTimes =
    includeTimes && category === 'transport'
      ? parseTransportTimesFromText(`${receipt.description} ${receipt.remark}`)
      : {};
  const startTime = receipt.startTime ?? parsedTransportTimes.startTime;
  const endTime = receipt.endTime ?? parsedTransportTimes.endTime;

  return {
    category,
    title: receipt.title,
    description: receipt.description,
    cost: receipt.cost,
    remark: receipt.remark,
    timeRange: {
      startDate: receipt.startDate,
      endDate: receipt.endDate,
      ...(includeTimes && startTime ? { startTime } : {}),
      ...(includeTimes && endTime ? { endTime } : {}),
    },
  };
}

export function applyTravelPlanReceiptToForm(
  current: TravelPlanAddFormValues,
  receipt: TravelPlanReceiptRecognizeForm,
): TravelPlanAddFormValues {
  return {
    ...current,
    ...travelPlanReceiptFormToAddFormValues(current.category, receipt),
    title: receipt.title || current.title,
    description: receipt.description || current.description,
    cost: receipt.cost || current.cost,
    remark: receipt.remark || current.remark,
  };
}

export function resolveRecognizedTravelPlanForms(
  result: Pick<RecognizeTravelPlanReceiptResult, 'form' | 'forms'>,
): TravelPlanReceiptRecognizeForm[] {
  if (result.forms?.length) {
    return result.forms;
  }
  return result.form ? [result.form] : [];
}

export function recognizedTravelPlanFormsToAddFormValues(
  category: TravelPlanAddFormCategory,
  receipts: TravelPlanReceiptRecognizeForm[],
): TravelPlanAddFormValues[] {
  return sortTravelPlanAddFormValues(
    receipts.map((receipt) => travelPlanReceiptFormToAddFormValues(category, receipt)),
  );
}
