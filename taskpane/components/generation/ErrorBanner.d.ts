import React from 'react';
interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}
/**
 * Error banner component for displaying generation errors
 * Implements FR-027, FR-027a
 */
export declare const ErrorBanner: React.FC<ErrorBannerProps>;
export {};
//# sourceMappingURL=ErrorBanner.d.ts.map