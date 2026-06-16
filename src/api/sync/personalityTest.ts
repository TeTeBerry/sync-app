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
