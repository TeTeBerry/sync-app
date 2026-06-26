import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from '../../../components/icons';
import { Button, cn } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  PLURR_RESPONSIBILITY_ORDER,
  PLURR_RESPONSIBILITY_TOTAL,
  type PlurrResponsibilityKey,
} from '@/domains/festival-plan/plurResponsibilityChecklist';
import {
  countPlurrResponsibilityChecked,
  loadPlurrResponsibility,
  togglePlurrResponsibilityItem,
} from '@/utils/plurResponsibility.storage';
import './EventDetailPlurrChecklist.scss';

type EventDetailPlurrChecklistProps = {
  activityLegacyId: number;
};

export function EventDetailPlurrChecklist({
  activityLegacyId,
}: EventDetailPlurrChecklistProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState(() => loadPlurrResponsibility(activityLegacyId));
  const checkedCount = useMemo(() => countPlurrResponsibilityChecked(state), [state]);

  const handleToggleItem = useCallback(
    (key: PlurrResponsibilityKey) => {
      const next = togglePlurrResponsibilityItem(activityLegacyId, key);
      setState(next);
    },
    [activityLegacyId],
  );

  return (
    <View className="s-plurr-checklist" data-cmp="EventDetailPlurrChecklist">
      <Button
        className="s-plurr-checklist__head"
        hoverClass="s-plurr-checklist__head--pressed"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <View className="s-plurr-checklist__head-main">
          <Text className="s-plurr-checklist__title">
            {t('plur.responsibility.sectionTitle')}
          </Text>
        </View>
        {checkedCount > 0 ? (
          <View className="s-plurr-checklist__pill">
            <Text className="s-plurr-checklist__pill-text">
              {t('festivalPlan.plurrProgress', {
                checked: checkedCount,
                total: PLURR_RESPONSIBILITY_TOTAL,
              })}
            </Text>
          </View>
        ) : null}
        {expanded ? (
          <ChevronUp size={16} color="#8e8e93" />
        ) : (
          <ChevronDown size={16} color="#8e8e93" />
        )}
      </Button>

      {expanded ? (
        <View className="s-plurr-checklist__body">
          {PLURR_RESPONSIBILITY_ORDER.map((key) => {
            const checked = state[key];
            return (
              <Button
                key={key}
                className="s-plurr-checklist__row"
                hoverClass="s-plurr-checklist__row--pressed"
                role="checkbox"
                aria-checked={checked}
                onClick={() => handleToggleItem(key)}
              >
                <View
                  className={cn(
                    's-plurr-checklist__check',
                    checked && 's-plurr-checklist__check--on',
                  )}
                />
                <View className="s-plurr-checklist__row-main">
                  <Text className="s-plurr-checklist__row-title">
                    {t(`plur.responsibility.${key}.title`)}
                  </Text>
                  <Text className="s-plurr-checklist__row-hint">
                    {t(`plur.responsibility.${key}.hint`)}
                  </Text>
                </View>
              </Button>
            );
          })}
          <Text className="s-plurr-checklist__disclaimer">
            {t('plur.responsibility.disclaimer')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
