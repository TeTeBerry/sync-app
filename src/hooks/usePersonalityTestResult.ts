import { useEffect, useState } from 'react';
import type { PersonalityTestResult } from '../domains/personality-test/types';
import {
  loadPersonalityTestResult,
  subscribePersonalityTestChange,
} from '../domains/personality-test/utils/personalityTestStorage';

/** Reactive local personality test result (nickname + cloud avatar key). */
export function usePersonalityTestResult(): PersonalityTestResult | null {
  const [result, setResult] = useState(() => loadPersonalityTestResult());

  useEffect(() => {
    return subscribePersonalityTestChange(() => {
      setResult(loadPersonalityTestResult());
    });
  }, []);

  return result;
}
