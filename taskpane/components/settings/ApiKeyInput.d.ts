import React from 'react';
export interface ApiKeyInputProps {
    value: string;
    onChange: (value: string) => void;
    onTestConnection: () => void;
    error?: string;
    isTestingConnection?: boolean;
    testConnectionResult?: {
        success: boolean;
        message: string;
    };
}
/**
 * Component for API key input with masking and test connection functionality
 */
export declare const ApiKeyInput: React.FC<ApiKeyInputProps>;
//# sourceMappingURL=ApiKeyInput.d.ts.map