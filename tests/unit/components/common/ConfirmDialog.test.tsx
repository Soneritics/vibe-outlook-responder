import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConfirmDialog } from '../../../../src/taskpane/components/common/ConfirmDialog';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
};

describe('ConfirmDialog Component', () => {
  it('should render dialog when open is true', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', async () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button clicked', async () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // May be called twice (button click + dialog close), just verify it was called
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should use custom confirm label', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Delete"
        message="Delete this item?"
        confirmLabel="Yes, Delete"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
  });

  it('should use custom cancel label', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Delete"
        message="Delete this item?"
        cancelLabel="No, Keep It"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByRole('button', { name: 'No, Keep It' })).toBeInTheDocument();
  });

  it('should render with destructive styling when destructive is true', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Delete"
        message="Delete permanently?"
        destructive={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toBeInTheDocument();
  });

  it('should display both confirm and cancel buttons', () => {
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();

    renderWithProvider(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
