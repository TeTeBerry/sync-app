import type { CSSProperties, FC, ReactNode } from 'react';
import { View } from '@tarojs/components';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { cn } from './cn';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  panelClassName?: string;
  overlayClassName?: string;
  zIndex?: string;
  catchMove?: boolean;
  ariaLabelledBy?: string;
  ariaHidden?: boolean;
  panelRole?: string;
  panelAriaModal?: boolean;
  children: ReactNode;
};

export const Sheet: FC<SheetProps> = ({
  open,
  onClose,
  panelClassName,
  overlayClassName,
  zIndex,
  catchMove,
  ariaLabelledBy,
  ariaHidden,
  panelRole,
  panelAriaModal,
  children,
}) => {
  useOverlayLock(open);

  const overlayStyle: CSSProperties | undefined = zIndex ? { zIndex } : undefined;

  return (
    <View
      className={cn(
        's-overlay s-overlay--sheet',
        overlayClassName,
        !open && 's-overlay--off',
      )}
      style={overlayStyle}
      catchMove={catchMove}
      role="presentation"
      aria-hidden={ariaHidden ?? !open}
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className={cn('s-overlay__panel', panelClassName)}
        role={panelRole}
        aria-modal={panelAriaModal}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={ariaHidden ?? !open}
      >
        {children}
      </View>
    </View>
  );
};
