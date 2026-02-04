import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GenerationProgress } from '../../../../src/taskpane/components/generation/GenerationProgress';

describe('GenerationProgress', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with initial step', () => {
      render(<GenerationProgress currentStep="preparing" onCancel={mockOnCancel} />);

      expect(screen.getByText(/preparing/i)).toBeInTheDocument();
    });

    it('should show all steps', () => {
      render(<GenerationProgress currentStep="preparing" onCancel={mockOnCancel} />);

      expect(screen.getByText(/preparing/i)).toBeInTheDocument();
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      expect(screen.getByText(/done/i)).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      render(<GenerationProgress currentStep="sending" onCancel={mockOnCancel} />);

      const sendingStep = screen.getByText(/sending/i);
      expect(sendingStep).toHaveClass('active');
    });

    it('should show completed steps', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      const preparingStep = screen.getByText(/preparing/i);
      expect(preparingStep).toHaveClass('completed');
    });

    it('should show cancel button when not done', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not show cancel button when done', () => {
      render(<GenerationProgress currentStep="done" onCancel={mockOnCancel} />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onCancel when cancel button clicked', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable cancel button when clicked', async () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  describe('step progression', () => {
    it('should update current step', () => {
      const { rerender } = render(
        <GenerationProgress currentStep="preparing" onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/preparing/i)).toHaveClass('active');

      rerender(<GenerationProgress currentStep="sending" onCancel={mockOnCancel} />);

      expect(screen.getByText(/sending/i)).toHaveClass('active');
      expect(screen.getByText(/preparing/i)).toHaveClass('completed');
    });

    it('should show progress percentage', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      // Should show some percentage (75% at generating step)
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
    });

    it('should show 100% when done', () => {
      render(<GenerationProgress currentStep="done" onCancel={mockOnCancel} />);

      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      render(
        <GenerationProgress
          currentStep="generating"
          error="API error occurred"
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/api error occurred/i)).toBeInTheDocument();
    });

    it('should highlight error state', () => {
      render(<GenerationProgress currentStep="generating" error="Error" onCancel={mockOnCancel} />);

      const errorElement = screen.getByText(/error/i);
      expect(errorElement).toHaveClass('error');
    });

    it('should not show cancel button when error', () => {
      render(<GenerationProgress currentStep="generating" error="Error" onCancel={mockOnCancel} />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should announce progress updates', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have accessible cancel button', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveAttribute('aria-label');
    });
  });

  describe('loading animation', () => {
    it('should show loading spinner during generation', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show spinner when done', () => {
      render(<GenerationProgress currentStep="done" onCancel={mockOnCancel} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('time estimation', () => {
    it('should show estimated time remaining', () => {
      render(
        <GenerationProgress currentStep="generating" estimatedTime={5} onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/5.*seconds/i)).toBeInTheDocument();
    });

    it('should not show time when not provided', () => {
      render(<GenerationProgress currentStep="generating" onCancel={mockOnCancel} />);

      expect(screen.queryByText(/seconds/i)).not.toBeInTheDocument();
    });
  });
});
