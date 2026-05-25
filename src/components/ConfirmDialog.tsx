import "./ConfirmDialog.scss";
import React from "react";
import { Button } from "./ui";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  /** Destructive actions (delete) use pink/red confirm styling */
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
  return (
    <div className={`s-confirm-dialog${open ? "" : " s-confirm-dialog--off"}`} role="presentation">
      <div className="s-confirm-dialog__backdrop" onClick={onCancel} />
      <div
        className="s-confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title" className="s-confirm-dialog__title">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="s-confirm-dialog__message">
          {message}
        </p>
        <div className="s-confirm-dialog__actions">
          <Button block="s-confirm-dialog" element="btn" modifiers={["cancel"]} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            block="s-confirm-dialog"
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
