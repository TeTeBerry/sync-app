import { describe, expect, it } from 'vitest';
import { shouldShowTravelGuideSelfDriveOption } from '@/constants/activityMapRegion';

describe('shouldShowTravelGuideSelfDriveOption', () => {
  it('shows self-drive only for domestic activities', () => {
    expect(shouldShowTravelGuideSelfDriveOption('domestic')).toBe(true);
    expect(shouldShowTravelGuideSelfDriveOption('overseas')).toBe(false);
    expect(shouldShowTravelGuideSelfDriveOption('hmt')).toBe(false);
    expect(shouldShowTravelGuideSelfDriveOption(undefined)).toBe(false);
    expect(shouldShowTravelGuideSelfDriveOption(null)).toBe(false);
  });
});
