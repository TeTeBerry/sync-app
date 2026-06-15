import type { TravelPlanAddFormValues } from './travelPlanAddForm';

const RIDE_HAILING_PATTERN =
  /滴滴|网约车|打车|快车|专车|出租车|高德打车|曹操出行|花小猪|T3出行|Uber|优步|首汽约车|美团打车|阳光出行/i;

const TICKET_LEG_PATTERN =
  /飞往|返程|回程|去程|航班|高铁|火车|车次|舱位|经济舱|二等座|一等座|商务座|始发|到达站|登机|候车/i;

const TICKET_CODE_PATTERN =
  /\bG\d{1,4}\b|\bD\d{1,4}\b|\bCA\d+\b|\bMU\d+\b|\bZH\d+\b|\bY\d{4}\b/i;

function formText(form: TravelPlanAddFormValues): string {
  return `${form.title} ${form.description} ${form.remark}`;
}

export function shouldMergeTransportForms(forms: TravelPlanAddFormValues[]): boolean {
  if (forms.length <= 1 || forms[0]?.category !== 'transport') {
    return false;
  }

  const combined = forms.map(formText).join(' ');
  const hasTicketMarkers =
    TICKET_LEG_PATTERN.test(combined) ||
    forms.some((form) => TICKET_CODE_PATTERN.test(formText(form)));
  const hasRideMarkers = forms.some((form) =>
    RIDE_HAILING_PATTERN.test(formText(form)),
  );

  if (hasTicketMarkers && forms.length <= 2 && !hasRideMarkers) {
    return false;
  }

  if (hasRideMarkers) {
    return true;
  }

  return forms.length >= 3 && !hasTicketMarkers;
}
