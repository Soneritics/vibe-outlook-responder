import React from 'react';
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
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
//# sourceMappingURL=ConfirmDialog.d.ts.map