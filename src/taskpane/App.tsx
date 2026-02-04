import React, { useEffect, useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { PromptEditor } from './components/prompts/PromptEditor';
import { MainScreen } from './components/main/MainScreen';
import { GenerationPanel } from './components/generation/GenerationPanel';
import { usePrompts } from './hooks/usePrompts';
import { Prompt } from '../models/Prompt';

const App: React.FC = () => {
  const [currentPanel, setCurrentPanel] = useState<string>('home');
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<Prompt | undefined>(undefined);
  const [generationPromptId, setGenerationPromptId] = useState<string | null>(null);
  const { createPrompt, updatePrompt, deletePrompt, getPrompt } = usePrompts();

  useEffect(() => {
    // Check URL parameters for panel routing
    const urlParams = new URLSearchParams(window.location.search);
    const panel = urlParams.get('panel');
    const promptId = urlParams.get('promptId');
    
    if (panel) {
      setCurrentPanel(panel);
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
    // Return to main screen
    setCurrentPanel('main');
    setEditPromptId(null);
    setEditPrompt(undefined);
  };

  const handleDeletePrompt = async () => {
    if (editPromptId) {
      await deletePrompt(editPromptId);
      // Return to main screen
      setCurrentPanel('main');
      setEditPromptId(null);
      setEditPrompt(undefined);
    }
  };

  const handleCancelPrompt = () => {
    // Return to main screen instead of closing
    setCurrentPanel('main');
    setEditPromptId(null);
    setEditPrompt(undefined);
  };

  const handleEditPrompt = (promptId: string) => {
    setEditPromptId(promptId);
    setCurrentPanel('prompt-editor');
  };

  const handleAddPrompt = () => {
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
      case 'prompt-editor': {
        return (
          <PromptEditor
            prompt={editPrompt}
            onSave={handleSavePrompt}
            onCancel={handleCancelPrompt}
            onDelete={editPromptId ? handleDeletePrompt : undefined}
          />
        );
      }
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
            onEditPrompt={handleEditPrompt}
            onAddPrompt={handleAddPrompt}
            onSettings={handleOpenSettings}
          />
        );
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      {renderPanel()}
    </FluentProvider>
  );
};

export default App;
