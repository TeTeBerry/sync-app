import type { BackendActivity } from '../types/backend';
import { filterActiveHomeFestivalShortcutChips } from './homeFestivalShortcuts';
import { t } from '@/i18n';

export type HomeFestivalExampleQuestion = {
  key: string;
  label: string;
  message: string;
};

const HOME_FESTIVAL_EXAMPLE_QUESTION_DEFS = [
  {
    key: 'tomorrowland-when',
    labelKey: 'home.exampleTomorrowlandWhen',
    messageKey: 'home.exampleTomorrowlandWhenMessage',
    hideWhenFestivalEnded: 'tomorrowland',
  },
  {
    key: 'edc-lineup',
    labelKey: 'home.exampleEdcLineup',
    messageKey: 'home.exampleEdcLineupMessage',
    hideWhenFestivalEnded: 'edc-thailand',
  },
  {
    key: 'near',
    labelKey: 'home.exampleNearFestivals',
    messageKey: 'home.lookupFestivalInitialMessage',
  },
] as const;

function isQuestionHidden(
  def: (typeof HOME_FESTIVAL_EXAMPLE_QUESTION_DEFS)[number],
  activeFestivalKeys: Set<string>,
): boolean {
  if (!('hideWhenFestivalEnded' in def) || !def.hideWhenFestivalEnded) {
    return false;
  }
  return !activeFestivalKeys.has(def.hideWhenFestivalEnded);
}

/** Homepage + prep tab example questions for festival lookup. */
export function buildHomeFestivalExampleQuestions(
  activities?: BackendActivity[] | null,
  now?: Date,
): HomeFestivalExampleQuestion[] {
  const activeChips = filterActiveHomeFestivalShortcutChips(activities, now);
  const activeFestivalKeys = new Set(activeChips.map((chip) => chip.key));

  return HOME_FESTIVAL_EXAMPLE_QUESTION_DEFS.filter(
    (def) => !isQuestionHidden(def, activeFestivalKeys),
  ).map((def) => ({
    key: def.key,
    label: t(def.labelKey),
    message: t(def.messageKey),
  }));
}

/** Map homepage example chip key to events-tab search query. */
export function resolveExampleChipSearchQuery(key: string): string | null {
  switch (key) {
    case 'tomorrowland-when':
      return 'Tomorrowland';
    case 'edc-lineup':
      return 'EDC';
    case 'near':
      return null;
    default:
      return null;
  }
}

/** Prep tab welcome chips: festival examples + near events + find team (unbound). */
export function buildUnboundWelcomeExampleQuestions(
  activities?: BackendActivity[] | null,
  now?: Date,
): HomeFestivalExampleQuestion[] {
  const examples = buildHomeFestivalExampleQuestions(activities, now);
  return examples.filter((item) => item.key !== 'near').slice(0, 2);
}
