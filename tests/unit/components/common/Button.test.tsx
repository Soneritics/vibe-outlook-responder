import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../../../../src/taskpane/components/common/Button';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

// Wrap components with FluentProvider for testing
const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
};

describe('Button Component', () => {
  it('should render button with text', () => {
    renderWithProvider(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(<Button onClick={handleClick}>Click Me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with primary appearance by default', () => {
    renderWithProvider(<Button>Primary Button</Button>);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toBeInTheDocument();
  });

  it('should render with secondary appearance', () => {
    renderWithProvider(<Button appearance="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProvider(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    await user.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with correct button type', () => {
    renderWithProvider(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should default to button type', () => {
    renderWithProvider(<Button>Default Type</Button>);
    const button = screen.getByRole('button', { name: 'Default Type' });
    expect(button).toHaveAttribute('type', 'button');
  });
});
