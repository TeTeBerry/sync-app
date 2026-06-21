import { beforeEach, describe, expect, it } from 'vitest';
import {
  selectOverlayLockActive,
  useOverlayLockStore,
} from '@/stores/overlayLockStore';

describe('overlayLockStore', () => {
  beforeEach(() => {
    useOverlayLockStore.setState({ lockCount: 0 });
  });

  it('tracks nested acquire/release via refcount', () => {
    const { acquire, release } = useOverlayLockStore.getState();

    acquire();
    acquire();
    expect(useOverlayLockStore.getState().lockCount).toBe(2);
    expect(selectOverlayLockActive(useOverlayLockStore.getState())).toBe(true);

    release();
    expect(useOverlayLockStore.getState().lockCount).toBe(1);
    expect(selectOverlayLockActive(useOverlayLockStore.getState())).toBe(true);

    release();
    expect(useOverlayLockStore.getState().lockCount).toBe(0);
    expect(selectOverlayLockActive(useOverlayLockStore.getState())).toBe(false);
  });

  it('does not drop below zero on extra release', () => {
    useOverlayLockStore.getState().release();
    expect(useOverlayLockStore.getState().lockCount).toBe(0);
  });

  it('reset clears any leaked locks', () => {
    const { acquire, reset } = useOverlayLockStore.getState();
    acquire();
    acquire();
    reset();
    expect(useOverlayLockStore.getState().lockCount).toBe(0);
  });
});
