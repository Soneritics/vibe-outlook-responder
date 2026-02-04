import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components';

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog message/content
   */
  message: string;

  /**
   * Label for the confirm button
   * @default 'Confirm'
   */
  confirmLabel?: string;

  /**
   * Label for the cancel button
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Callback when user confirms
   */
  onConfirm: () => void;

  /**
   * Callback when user cancels or closes dialog
   */
  onCancel: () => void;

  /**
   * Whether the action is destructive (uses warning color)
   * @default false
   */
  destructive?: boolean;
}

/**
 * Reusable confirmation dialog component
 * Used for delete confirmations and reset operations
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onCancel()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{message}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </DialogTrigger>
            <Button
              appearance={destructive ? 'primary' : 'primary'}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
