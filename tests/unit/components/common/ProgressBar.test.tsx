import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from '../../../../src/taskpane/components/common/ProgressBar';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
};

describe('ProgressBar Component', () => {
  const mockSteps = [
    { id: 'step1', label: 'Preparing' },
    { id: 'step2', label: 'Sending' },
    { id: 'step3', label: 'Generating' },
    { id: 'step4', label: 'Done' },
  ];

  it('should render all step labels', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step1" />);

    expect(screen.getByText(/Preparing/)).toBeInTheDocument();
    expect(screen.getByText(/Sending/)).toBeInTheDocument();
    expect(screen.getByText(/Generating/)).toBeInTheDocument();
    expect(screen.getByText(/Done/)).toBeInTheDocument();
  });

  it('should highlight current step', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step2" />);

    const stepText = screen.getByText(/Sending/);
    expect(stepText).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    renderWithProvider(
      <ProgressBar steps={mockSteps} currentStep="step2" error="An error occurred" />
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('should not display error when not provided', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step1" />);

    const errorText = screen.queryByText('An error occurred');
    expect(errorText).not.toBeInTheDocument();
  });

  it('should show arrows between steps', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step1" />);

    // Check for arrows in the rendered text
    const container = screen.getByText(/Preparing/).closest('div');
    expect(container?.textContent).toContain('→');
  });

  it('should handle single step', () => {
    const singleStep = [{ id: 'only', label: 'Only Step' }];
    renderWithProvider(<ProgressBar steps={singleStep} currentStep="only" />);

    expect(screen.getByText('Only Step')).toBeInTheDocument();
  });

  it('should calculate progress correctly', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step2" />);

    // Step 2 is the second step out of 4, so progress should be 50%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should show 100% progress when on last step', () => {
    renderWithProvider(<ProgressBar steps={mockSteps} currentStep="step4" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});
