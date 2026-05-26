import "../styles/_overlay.scss";
import React from "react";
import { useOverlayLock } from "../hooks/useOverlayLock";
import { Button, cn } from "./ui";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  /** Destructive actions (delete, logout) use theme destructive styling */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  onConfirm,
  onCancel,
}) => {
  useOverlayLock(open);

  return (
    <div
      className={cn("s-overlay s-confirm-dialog", !open && "s-overlay--off")}
      style={{ zIndex: "var(--overlay-z-dialog)" }}
      role="presentation"
    >
      <div className="s-overlay__backdrop" onClick={onCancel} />
      <div
        className="s-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title" className="s-overlay__title">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="s-overlay__message">
          {message}
        </p>
        <div className="s-overlay__actions">
          <Button
            block="s-overlay"
            element="btn"
            modifiers={["cancel"]}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            block="s-overlay"
            element="btn"
            modifiers={["confirm", danger && "danger"]}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
