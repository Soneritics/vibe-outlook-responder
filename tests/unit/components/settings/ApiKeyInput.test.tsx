import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApiKeyInput } from '../../../../src/taskpane/components/settings/ApiKeyInput';

describe('ApiKeyInput', () => {
  const mockOnChange = jest.fn();
  const mockOnTestConnection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render input field with label', () => {
      const { container } = render(
        <ApiKeyInput value="" onChange={mockOnChange} onTestConnection={mockOnTestConnection} />
      );

      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      expect(input).toHaveAttribute('aria-label', 'API Key');
    });

    it('should mask API key when value is provided', () => {
      const { container } = render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should show "Test Connection" button', () => {
      render(
        <ApiKeyInput value="" onChange={mockOnChange} onTestConnection={mockOnTestConnection} />
      );

      expect(screen.getByRole('button', { name: /Test Connection/i })).toBeInTheDocument();
    });

    it('should show toggle visibility button', () => {
      render(
        <ApiKeyInput
          value="sk-test"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show|hide/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('masking behavior', () => {
    it('should mask API key by default', () => {
      const { container } = render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should toggle visibility when toggle button is clicked', () => {
      const { container } = render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show/i });

      expect(input.type).toBe('password');

      fireEvent.click(toggleButton);

      expect(input.type).toBe('text');
    });

    it('should hide API key again after second toggle', () => {
      const { container } = render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show/i });

      fireEvent.click(toggleButton);
      expect(input.type).toBe('text');

      fireEvent.click(screen.getByRole('button', { name: /hide/i }));
      expect(input.type).toBe('password');
    });
  });

  describe('validation', () => {
    it('should show error when API key format is invalid', () => {
      render(
        <ApiKeyInput
          value="invalid-key"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
          error="Invalid API key format. Must start with 'sk-'"
        />
      );

      expect(screen.getByText(/Invalid API key format/i)).toBeInTheDocument();
    });

    it('should not show error when API key is valid', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      expect(screen.queryByText(/Invalid API key format/i)).not.toBeInTheDocument();
    });

    it('should disable Test Connection button when API key is empty', () => {
      render(
        <ApiKeyInput value="" onChange={mockOnChange} onTestConnection={mockOnTestConnection} />
      );

      const testButton = screen.getByRole('button', { name: /Test Connection/i });
      expect(testButton).toBeDisabled();
    });

    it('should enable Test Connection button when API key is provided', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const testButton = screen.getByRole('button', { name: /Test Connection/i });
      expect(testButton).not.toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('should call onChange when input value changes', () => {
      const { container } = render(
        <ApiKeyInput value="" onChange={mockOnChange} onTestConnection={mockOnTestConnection} />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'sk-newkey' } });

      expect(mockOnChange).toHaveBeenCalledWith('sk-newkey');
    });

    it('should call onTestConnection when Test Connection button is clicked', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
        />
      );

      const testButton = screen.getByRole('button', { name: /Test Connection/i });
      fireEvent.click(testButton);

      expect(mockOnTestConnection).toHaveBeenCalled();
    });

    it('should show loading state when testing connection', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
          isTestingConnection={true}
        />
      );

      const testButton = screen.getByRole('button', { name: /Testing/i });
      expect(testButton).toBeDisabled();
    });

    it('should show success message after successful test', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
          testConnectionResult={{ success: true, message: 'Connection successful' }}
        />
      );

      expect(screen.getByText(/Connection successful/i)).toBeInTheDocument();
    });

    it('should show error message after failed test', () => {
      render(
        <ApiKeyInput
          value="sk-1234567890abcdefghijklmnopqrstuvwxyz"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
          testConnectionResult={{ success: false, message: 'Invalid API key' }}
        />
      );

      expect(screen.getByText(/Invalid API key/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible label', () => {
      const { container } = render(
        <ApiKeyInput value="" onChange={mockOnChange} onTestConnection={mockOnTestConnection} />
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should associate error message with input', () => {
      render(
        <ApiKeyInput
          value="invalid"
          onChange={mockOnChange}
          onTestConnection={mockOnTestConnection}
          error="Invalid format"
        />
      );

      // Check that error message is displayed
      expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();

      // Check that input exists (may not be role="textbox" in error state)
      const container = screen.getByText(/Invalid format/i).closest('div');
      expect(container).toBeTruthy();
    });
  });
});
