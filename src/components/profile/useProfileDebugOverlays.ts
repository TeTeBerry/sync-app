import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import { go, ROUTES } from '../../utils/route';
import type { PackageTierId } from './profilePackageData';
import {
  isProfileDebugEntitlementsEnabled,
  PROFILE_DEBUG_ENTITLEMENT_LABELS,
  persistProfileDebugEntitlementPreset,
  profileDebugEntitlementActionSheetItems,
  profileDebugPresetFromActionSheetIndex,
  readProfileDebugEntitlementPreset,
  type ProfileDebugEntitlementPreset,
} from './profileDebugEntitlements';
import { buildDebugContactUnlockExhaustedPreview } from './profileDebugModals';
import type { ProfileDebugSectionProps } from './ProfileDebugSection';

export type ProfileDebugOverlayViewModel = {
  enabled: boolean;
  contactUnlockOpen: boolean;
  aiMatchOpen: boolean;
  preview: ReturnType<typeof buildDebugContactUnlockExhaustedPreview>;
  activityLegacyId: number;
  onCloseContactUnlock: () => void;
  onCloseAiMatch: () => void;
  onUpgradeContactUnlock: (tierId: PackageTierId) => void;
  onViewAllBenefits: () => void;
};

export type UseProfileDebugOverlaysOptions = {
  openPackageSheet: (options?: { initialSelectedTierId?: PackageTierId }) => void;
};

export function useProfileDebugOverlays({
  openPackageSheet,
}: UseProfileDebugOverlaysOptions) {
  const debugEntitlementsEnabled = isProfileDebugEntitlementsEnabled();
  const [debugEntitlementPreset, setDebugEntitlementPreset] =
    useState<ProfileDebugEntitlementPreset>(() => readProfileDebugEntitlementPreset());
  const [debugContactUnlockExhaustedOpen, setDebugContactUnlockExhaustedOpen] =
    useState(false);
  const [debugAiMatchExhaustedOpen, setDebugAiMatchExhaustedOpen] = useState(false);
  const debugContactUnlockPreview = useMemo(
    () => buildDebugContactUnlockExhaustedPreview(),
    [],
  );

  const handleDebugEntitlements = useCallback(() => {
    if (!debugEntitlementsEnabled) return;
    void Taro.showActionSheet({
      itemList: profileDebugEntitlementActionSheetItems(),
      success: (res) => {
        const preset = profileDebugPresetFromActionSheetIndex(res.tapIndex);
        persistProfileDebugEntitlementPreset(preset);
        setDebugEntitlementPreset(preset);
        void Taro.showToast({
          title: PROFILE_DEBUG_ENTITLEMENT_LABELS[preset],
          icon: 'none',
        });
      },
    });
  }, [debugEntitlementsEnabled]);

  const debugSection: ProfileDebugSectionProps | null = debugEntitlementsEnabled
    ? {
        preset: debugEntitlementPreset,
        onSelectPreset: handleDebugEntitlements,
        onPreviewContactUnlockExhausted: () => setDebugContactUnlockExhaustedOpen(true),
        onPreviewAiMatchExhausted: () => setDebugAiMatchExhaustedOpen(true),
      }
    : null;

  const debugOverlay: ProfileDebugOverlayViewModel = {
    enabled: debugEntitlementsEnabled,
    contactUnlockOpen: debugContactUnlockExhaustedOpen,
    aiMatchOpen: debugAiMatchExhaustedOpen,
    preview: debugContactUnlockPreview,
    activityLegacyId: PROFILE_SEED_ACTIVITY_LEGACY_ID,
    onCloseContactUnlock: () => setDebugContactUnlockExhaustedOpen(false),
    onCloseAiMatch: () => setDebugAiMatchExhaustedOpen(false),
    onUpgradeContactUnlock: (tierId) => {
      setDebugContactUnlockExhaustedOpen(false);
      openPackageSheet({ initialSelectedTierId: tierId });
    },
    onViewAllBenefits: () => {
      setDebugAiMatchExhaustedOpen(false);
      go(ROUTES.PROFILE_BENEFITS);
    },
  };

  return {
    debugEntitlementsEnabled,
    debugEntitlementPreset,
    debugSection,
    debugOverlay,
  };
}
