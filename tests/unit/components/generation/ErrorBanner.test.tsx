import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../../../../src/taskpane/components/generation/ErrorBanner';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

describe('ErrorBanner', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
  );

  describe('Rendering', () => {
    it('should render error message', () => {
      render(<ErrorBanner message="Test error message" />, { wrapper });

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should not render Retry button when onRetry is not provided', () => {
      render(<ErrorBanner message="Test error" />, { wrapper });

      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    it('should not render Dismiss button when onDismiss is not provided', () => {
      render(<ErrorBanner message="Test error" />, { wrapper });

      expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
    });

    it('should render Retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      render(<ErrorBanner message="Test error" onRetry={onRetry} />, { wrapper });

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should render Dismiss button when onDismiss is provided', () => {
      const onDismiss = jest.fn();
      render(<ErrorBanner message="Test error" onDismiss={onDismiss} />, { wrapper });

      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should render both buttons when both callbacks provided', () => {
      const onRetry = jest.fn();
      const onDismiss = jest.fn();
      render(
        <ErrorBanner message="Test error" onRetry={onRetry} onDismiss={onDismiss} />,
        { wrapper }
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onRetry when Retry button clicked', () => {
      const onRetry = jest.fn();
      render(<ErrorBanner message="Test error" onRetry={onRetry} />, { wrapper });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when Dismiss button clicked', () => {
      const onDismiss = jest.fn();
      render(<ErrorBanner message="Test error" onDismiss={onDismiss} />, { wrapper });

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on Retry button', () => {
      const onRetry = jest.fn();
      render(<ErrorBanner message="Test error" onRetry={onRetry} />, { wrapper });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Message Types', () => {
    it('should render API key error message', () => {
      const message = 'Invalid API key. Please check your settings.';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render rate limit error message', () => {
      const message = 'Rate limit exceeded. Please wait and try again.';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render API unavailable error message', () => {
      const message = 'OpenAI API is temporarily unavailable.';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render content policy violation error message', () => {
      const message = 'Content policy violation: Your request was flagged';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render no API key configured error message', () => {
      const message = 'No API key configured. Please configure in settings.';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render generic error message', () => {
      const message = 'An unexpected error occurred. Please try again.';
      render(<ErrorBanner message={message} />, { wrapper });

      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes for error state', () => {
      const { container } = render(<ErrorBanner message="Test error" />, { wrapper });

      // MessageBar from Fluent UI should have role="alert" or similar
      const messageBar = container.querySelector('[role]');
      expect(messageBar).toBeInTheDocument();
    });

    it('should render buttons with accessible labels', () => {
      const onRetry = jest.fn();
      const onDismiss = jest.fn();
      render(
        <ErrorBanner message="Test error" onRetry={onRetry} onDismiss={onDismiss} />,
        { wrapper }
      );

      const retryButton = screen.getByText('Retry');
      const dismissButton = screen.getByText('Dismiss');

      expect(retryButton).toHaveAccessibleName('Retry');
      expect(dismissButton).toHaveAccessibleName('Dismiss');
    });
  });
});
