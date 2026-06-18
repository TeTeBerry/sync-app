import { apiGet, apiPost } from '../../utils/apiClient';
import type { PersonalityTestCatalog } from '@/domains/personality-test/personalityTestCatalog';
import type {
  PersonalityQuestion,
  PersonalityTestAnswers,
  PersonalityTestResult,
} from '@/domains/personality-test/types';
import { ownerQueryParams } from '../requestContext';

export type PersonalityTestQuestionsResponse = {
  version: number;
  questionCount: number;
  questions: PersonalityQuestion[];
  questionIds: string[];
};

export function fetchPersonalityTestCatalog() {
  return apiGet<PersonalityTestCatalog>(
    '/personality-test/catalog',
    ownerQueryParams(),
  );
}

export function fetchPersonalityTestQuestions() {
  return apiGet<PersonalityTestQuestionsResponse>(
    '/personality-test/questions',
    ownerQueryParams(),
  );
}

export function fetchPersonalityTestMediaUrls(keys: string[]) {
  const uniqueKeys = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
  if (!uniqueKeys.length) {
    return Promise.resolve({ urls: {} as Record<string, string> });
  }
  return apiGet<{ urls: Record<string, string> }>('/personality-test/media-urls', {
    ...ownerQueryParams(),
    keys: uniqueKeys.join(','),
  });
}

export function fetchPersonalityTestResult() {
  return apiGet<PersonalityTestResult | null>(
    '/personality-test/result',
    ownerQueryParams(),
  );
}

export function fetchPersonalityNicknameUsage(nickname: string) {
  const trimmed = nickname.trim();
  return apiGet<{ nickname: string; userCount: number }>(
    '/personality-test/nickname-usage',
    {
      ...ownerQueryParams(),
      nickname: trimmed,
    },
  );
}

export function persistPersonalityTestResultToServer(result: PersonalityTestResult) {
  return apiPost<PersonalityTestResult>(
    '/personality-test/save',
    { result },
    ownerQueryParams(),
  );
}

export function submitPersonalityTest(
  answers: PersonalityTestAnswers,
  questionIds: string[],
) {
  return apiPost<PersonalityTestResult>(
    '/personality-test/submit',
    { answers, questionIds },
    ownerQueryParams(),
  );
}
