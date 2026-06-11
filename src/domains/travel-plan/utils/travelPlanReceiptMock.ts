import type {
  RecognizeTravelPlanReceiptResult,
  TravelPlanReceiptCategory,
  TravelPlanReceiptRecognizeForm,
} from '@/types/backend';

function mockYear() {
  return String(new Date().getFullYear());
}

function buildMockTransportRoundTrip(): TravelPlanReceiptRecognizeForm[] {
  const year = mockYear();
  return [
    {
      title: '飞往深圳',
      description: 'Y87566 · 上海浦东-深圳宝安 · 06-13 12:55-15:25',
      cost: '768',
      remark: '',
      startDate: `${year}-06-13`,
      endDate: `${year}-06-13`,
      startTime: '12:55',
      endTime: '15:25',
    },
    {
      title: '返程上海',
      description: 'ZH9521 · 深圳宝安-上海浦东 · 06-15 14:50-17:20',
      cost: '768',
      remark: '',
      startDate: `${year}-06-15`,
      endDate: `${year}-06-15`,
      startTime: '14:50',
      endTime: '17:20',
    },
  ];
}

function buildMockByCategory(): Record<
  TravelPlanReceiptCategory,
  TravelPlanReceiptRecognizeForm | TravelPlanReceiptRecognizeForm[]
> {
  const year = mockYear();
  return {
    transport: buildMockTransportRoundTrip(),
    hotel: {
      title: '入住深圳湾万豪酒店',
      description: '豪华大床房 · 含早餐 · 入住1晚',
      cost: '980',
      remark: '预订号 MARRY20240612',
      startDate: `${year}-06-12`,
      endDate: `${year}-06-13`,
    },
    dining: {
      title: '海底捞火锅',
      description: '双人套餐 · 番茄锅底',
      cost: '268',
      remark: '桌号 A12',
      startDate: `${year}-06-12`,
      endDate: `${year}-06-12`,
    },
    event: {
      title: '风暴电音节 Day1',
      description: '单日票 · VIP 区',
      cost: '880',
      remark: '订单号 STORM20240613',
      startDate: `${year}-06-13`,
      endDate: `${year}-06-13`,
    },
  };
}

function resolveMockForms(
  category: TravelPlanReceiptCategory,
): TravelPlanReceiptRecognizeForm[] {
  const mock = buildMockByCategory()[category];
  return Array.isArray(mock) ? mock : [mock];
}

export function mockRecognizeTravelPlanReceipt(
  category: TravelPlanReceiptCategory,
): RecognizeTravelPlanReceiptResult {
  const forms = resolveMockForms(category);
  return {
    ok: true,
    filled: true,
    category,
    form: forms[0],
    forms,
    message:
      category === 'transport'
        ? 'AI 识别完成，已拆分为 2 段单程（总价 ¥1536）'
        : forms.length > 1
          ? `AI 识别完成，已拆分为 ${forms.length} 段单程`
          : 'AI 识别完成，已自动填入',
  };
}
