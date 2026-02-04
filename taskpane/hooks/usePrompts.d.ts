/**
 * usePrompts hook - React hook for managing prompts
 * Provides CRUD operations and loading states for prompt management
 */
import { Prompt } from '../../models/Prompt';
interface UsePromptsReturn {
    prompts: Prompt[];
    loading: boolean;
    error: string | null;
    getPrompt: (id: string) => Promise<Prompt | null>;
    createPrompt: (data: {
        title: string;
        content: string;
    }) => Promise<Prompt>;
    updatePrompt: (id: string, updates: {
        title?: string;
        content?: string;
    }) => Promise<Prompt>;
    deletePrompt: (id: string) => Promise<void>;
    isTitleUnique: (title: string, excludeId?: string) => Promise<boolean>;
    refreshPrompts: () => Promise<void>;
}
/**
 * Custom hook for managing prompts with CRUD operations
 * @returns Object with prompts, loading state, error state, and CRUD functions
 */
export declare function usePrompts(): UsePromptsReturn;
export {};
//# sourceMappingURL=usePrompts.d.ts.map