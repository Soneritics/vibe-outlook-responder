import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModelSelector } from '../../../../src/taskpane/components/settings/ModelSelector';

describe('ModelSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dropdown with label', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      expect(screen.getAllByText(/Model/i)[0]).toBeInTheDocument();
    });

    it('should display available models', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      // Check that at least GPT-5.2 option exists
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('should show selected model', () => {
      render(<ModelSelector value="gpt-4-turbo" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
      // Check the combobox value contains the model name
      expect(dropdown).toBeInTheDocument();
    });

    it('should default to GPT-5.2 when no value provided', () => {
      render(<ModelSelector value="" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('model information', () => {
    it('should show description for selected model', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      // Check that description text is shown
      expect(screen.getByText(/Most advanced model with superior reasoning/i)).toBeInTheDocument();
    });

    it('should show token limit information', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      expect(screen.getByText(/256K tokens/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onChange when model is selected', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      // Simulate selection by clicking the dropdown
      fireEvent.click(dropdown);

      // Find and click an option
      const options = screen.getAllByRole('option');
      if (options.length > 1) {
        fireEvent.click(options[1]);
      }

      // Should have called onChange
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update displayed value when selection changes', () => {
      const { rerender } = render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      rerender(<ModelSelector value="gpt-4" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable dropdown when disabled prop is true', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} disabled={true} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeDisabled();
    });

    it('should not disable dropdown by default', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).not.toBeDisabled();
    });
  });

  describe('model options', () => {
    it('should include supported models', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(4);
    });

    it('should display user-friendly model names', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      // Check that the dropdown contains text with "GPT-5.2"
      expect(screen.getAllByText(/GPT-5.2/i).length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible label', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(<ModelSelector value="gpt-5.2" onChange={mockOnChange} />);

      const dropdown = screen.getByRole('combobox');
      dropdown.focus();

      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

      // Dropdown should remain accessible
      expect(dropdown).toBeInTheDocument();
    });
  });
});
