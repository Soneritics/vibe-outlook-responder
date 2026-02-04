import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportImport } from '../../../../src/taskpane/components/settings/ExportImport';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Prompt } from '../../../../src/models/Prompt';
import * as clipboardUtils from '../../../../src/utils/clipboard';

// Mock clipboard utilities
jest.mock('../../../../src/utils/clipboard');

const mockCopyToClipboard = clipboardUtils.copyToClipboard as jest.MockedFunction<
  typeof clipboardUtils.copyToClipboard
>;
const mockReadFromClipboard = clipboardUtils.readFromClipboard as jest.MockedFunction<
  typeof clipboardUtils.readFromClipboard
>;

describe('ExportImport', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
  );

  const mockPrompts: Prompt[] = [
    {
      id: '1',
      title: 'Test Prompt 1',
      content: 'Test content 1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Test Prompt 2',
      content: 'Test content 2',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Export Functionality', () => {
    it('should render export button', () => {
      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      expect(screen.getByText('Export to Clipboard')).toBeInTheDocument();
    });

    it('should export prompts to clipboard as JSON', async () => {
      mockCopyToClipboard.mockResolvedValue(true);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const exportButton = screen.getByText('Export to Clipboard');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
        const exportedJson = mockCopyToClipboard.mock.calls[0][0];
        const parsedJson = JSON.parse(exportedJson);
        expect(parsedJson).toHaveLength(2);
        expect(parsedJson[0].title).toBe('Test Prompt 1');
      });
    });

    it('should show success message after export', async () => {
      mockCopyToClipboard.mockResolvedValue(true);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const exportButton = screen.getByText('Export to Clipboard');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Successfully exported 2 prompt\(s\)/)).toBeInTheDocument();
      });
    });

    it('should show error message if export fails', async () => {
      mockCopyToClipboard.mockRejectedValue(new Error('Failed to copy to clipboard'));

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const exportButton = screen.getByText('Export to Clipboard');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Export failed: Failed to copy to clipboard/)).toBeInTheDocument();
      });
    });

    it('should disable export button when no prompts exist', () => {
      render(<ExportImport prompts={[]} onImport={mockOnImport} />, { wrapper });

      const exportButton = screen.getByText('Export to Clipboard');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Import Functionality', () => {
    it('should render import button', () => {
      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      expect(screen.getByText('Import from Clipboard')).toBeInTheDocument();
    });

    it('should import valid prompts from clipboard', async () => {
      const importData = [
        {
          title: 'Imported Prompt',
          content: 'Imported content',
        },
      ];
      mockReadFromClipboard.mockResolvedValue(JSON.stringify(importData));
      mockOnImport.mockResolvedValue(undefined);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalledTimes(1);
        const importedPrompts = mockOnImport.mock.calls[0][0];
        expect(importedPrompts).toHaveLength(1);
        expect(importedPrompts[0].title).toBe('Imported Prompt');
      });
    });

    it('should show success message after import', async () => {
      const importData = [{ title: 'Test', content: 'Test' }];
      mockReadFromClipboard.mockResolvedValue(JSON.stringify(importData));
      mockOnImport.mockResolvedValue(undefined);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Successfully imported 1 prompt\(s\)/)).toBeInTheDocument();
      });
    });

    it('should handle duplicate prompt titles by appending "(imported)"', async () => {
      const importData = [
        {
          title: 'Test Prompt 1', // Duplicate of existing
          content: 'New content',
        },
      ];
      mockReadFromClipboard.mockResolvedValue(JSON.stringify(importData));
      mockOnImport.mockResolvedValue(undefined);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalledTimes(1);
        const importedPrompts = mockOnImport.mock.calls[0][0];
        expect(importedPrompts[0].title).toBe('Test Prompt 1 (imported)');
      });
    });

    it('should show error for empty clipboard', async () => {
      mockReadFromClipboard.mockResolvedValue('');

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Clipboard is empty/)).toBeInTheDocument();
      });
    });

    it('should show error for invalid JSON', async () => {
      mockReadFromClipboard.mockResolvedValue('not valid json');

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON format/)).toBeInTheDocument();
      });
    });

    it('should show error for non-array data', async () => {
      mockReadFromClipboard.mockResolvedValue(JSON.stringify({ title: 'Test' }));

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Expected an array/)).toBeInTheDocument();
      });
    });

    it('should show error for invalid prompt structure', async () => {
      const invalidData = [{ title: 'Test' }]; // Missing content
      mockReadFromClipboard.mockResolvedValue(JSON.stringify(invalidData));

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid prompt structure/)).toBeInTheDocument();
      });
    });
  });

  describe('UI States', () => {
    it('should disable buttons while exporting', async () => {
      mockCopyToClipboard.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const exportButton = screen.getByText('Export to Clipboard');
      fireEvent.click(exportButton);

      expect(screen.getByText('Exporting...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Export to Clipboard')).toBeInTheDocument();
      });
    });

    it('should disable buttons while importing', async () => {
      mockReadFromClipboard.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('[]'), 100))
      );
      mockOnImport.mockResolvedValue(undefined);

      render(<ExportImport prompts={mockPrompts} onImport={mockOnImport} />, {
        wrapper,
      });

      const importButton = screen.getByText('Import from Clipboard');
      fireEvent.click(importButton);

      expect(screen.getByText('Importing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Import from Clipboard')).toBeInTheDocument();
      });
    });
  });
});
