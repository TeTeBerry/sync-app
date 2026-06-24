import { useCallback, useEffect, useState } from 'react';

export type BuddyPostSheetWizardStep = 'form' | 'compose' | 'preview';

type UseBuddyPostSheetWizardOptions = {
  open: boolean;
  mode: 'create' | 'edit';
};

export function useBuddyPostSheetWizard({
  open,
  mode,
}: UseBuddyPostSheetWizardOptions) {
  const [step, setStep] = useState<BuddyPostSheetWizardStep>('form');

  useEffect(() => {
    if (!open) {
      setStep('form');
    }
  }, [open]);

  const isWizard = mode === 'create';

  const goNext = useCallback(() => {
    if (!isWizard) return;
    setStep((current) => {
      if (current === 'form') return 'compose';
      if (current === 'compose') return 'preview';
      return current;
    });
  }, [isWizard]);

  const goBack = useCallback(() => {
    if (!isWizard) return;
    setStep((current) => {
      if (current === 'preview') return 'compose';
      if (current === 'compose') return 'form';
      return current;
    });
  }, [isWizard]);

  return {
    step,
    isWizard,
    goNext,
    goBack,
    setStep,
  };
}
