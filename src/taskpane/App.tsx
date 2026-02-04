import React, { useEffect, useState, lazy, Suspense } from 'react';
import { FluentProvider, webLightTheme, Spinner } from '@fluentui/react-components';
import { usePrompts } from './hooks/usePrompts';
import { Prompt } from '../models/Prompt';

// Lazy load all major panels for better performance
const SettingsPanel = lazy(() =>
  import('./components/settings/SettingsPanel').then((m) => ({ default: m.SettingsPanel }))
);
const PromptEditor = lazy(() =>
  import('./components/prompts/PromptEditor').then((m) => ({ default: m.PromptEditor }))
);
const ManagePromptsScreen = lazy(() =>
  import('./components/prompts/ManagePromptsScreen').then((m) => ({
    default: m.ManagePromptsScreen,
  }))
);
const MainScreen = lazy(() =>
  import('./components/main/MainScreen').then((m) => ({ default: m.MainScreen }))
);
const GenerationPanel = lazy(() =>
  import('./components/generation/GenerationPanel').then((m) => ({ default: m.GenerationPanel }))
);
const GenerateScreen = lazy(() =>
  import('./components/generation/GenerateScreen').then((m) => ({ default: m.GenerateScreen }))
);

const App: React.FC = () => {
  const [currentPanel, setCurrentPanel] = useState<string>('manage-prompts');
  const [previousPanel, setPreviousPanel] = useState<string>('manage-prompts');
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<Prompt | undefined>(undefined);
  const [generationPromptId, setGenerationPromptId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { createPrompt, updatePrompt, deletePrompt, getPrompt } = usePrompts();

  useEffect(() => {
    // Check URL parameters for panel routing
    const urlParams = new URLSearchParams(window.location.search);
    const panel = urlParams.get('panel');
    const promptId = urlParams.get('promptId');

    if (panel) {
      setCurrentPanel(panel);
    } else {
      // Default to manage-prompts if no panel specified
      setCurrentPanel('manage-prompts');
    }
    if (promptId) {
      if (panel === 'generation') {
        setGenerationPromptId(promptId);
      } else {
        setEditPromptId(promptId);
      }
    }
  }, []);

  // Load the prompt data when editPromptId changes
  useEffect(() => {
    if (editPromptId) {
      getPrompt(editPromptId).then((prompt) => {
        if (prompt) {
          setEditPrompt(prompt);
        }
      });
    } else {
      setEditPrompt(undefined);
    }
  }, [editPromptId, getPrompt]);

  const handleSavePrompt = async (data: { title: string; content: string }) => {
    if (editPromptId) {
      // Update existing prompt
      await updatePrompt(editPromptId, data);
    } else {
      // Create new prompt
      await createPrompt(data);
    }
    // Force refresh by incrementing key
    setRefreshKey((k) => k + 1);
    // Stay in panel - navigate to manage-prompts (FR-052)
    setCurrentPanel('manage-prompts');
    setEditPromptId(null);
    setEditPrompt(undefined);
  };

  const handleDeletePrompt = async () => {
    if (editPromptId) {
      await deletePrompt(editPromptId);
      // Force refresh by incrementing key
      setRefreshKey((k) => k + 1);
      // Navigate to manage-prompts
      setCurrentPanel('manage-prompts');
      setEditPromptId(null);
      setEditPrompt(undefined);
    }
  };

  const handleBack = () => {
    // Navigate back to previous panel
    setCurrentPanel(previousPanel);
    setEditPromptId(null);
    setEditPrompt(undefined);
  };

  const handleCancelPrompt = () => {
    // Return to manage-prompts instead of closing
    setCurrentPanel('manage-prompts');
    setEditPromptId(null);
    setEditPrompt(undefined);
  };

  const handleEditPrompt = (promptId: string) => {
    setPreviousPanel(currentPanel);
    setEditPromptId(promptId);
    setCurrentPanel('prompt-editor');
  };

  const handleAddPrompt = () => {
    setPreviousPanel(currentPanel);
    setEditPromptId(null);
    setEditPrompt(undefined);
    setCurrentPanel('prompt-editor');
  };

  const handleOpenSettings = () => {
    setCurrentPanel('settings');
  };

  const renderPanel = () => {
    switch (currentPanel) {
      case 'settings':
        return <SettingsPanel />;
      case 'manage-prompts':
        return (
          <ManagePromptsScreen
            key={refreshKey}
            onEditPrompt={handleEditPrompt}
            onAddPrompt={handleAddPrompt}
          />
        );
      case 'prompt-editor': {
        return (
          <PromptEditor
            prompt={editPrompt}
            onSave={handleSavePrompt}
            onCancel={handleCancelPrompt}
            onDelete={editPromptId ? handleDeletePrompt : undefined}
            onBack={handleBack}
          />
        );
      }
      case 'generate':
        return <GenerateScreen onOpenSettings={handleOpenSettings} onAddPrompt={handleAddPrompt} />;
      case 'generation': {
        if (!generationPromptId) {
          return <div>Error: No prompt ID provided for generation</div>;
        }
        return <GenerationPanel promptId={generationPromptId} />;
      }
      case 'main':
      default:
        return (
          <MainScreen
            key={refreshKey}
            onEditPrompt={handleEditPrompt}
            onAddPrompt={handleAddPrompt}
            onSettings={handleOpenSettings}
          />
        );
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <Spinner label="Loading..." />
          </div>
        }
      >
        {renderPanel()}
      </Suspense>
    </FluentProvider>
  );
};

export default App;
