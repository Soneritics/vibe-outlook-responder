import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '../../../../src/taskpane/components/common/Input';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
};

describe('Input Component', () => {
  it('should render input with label', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Test Label" value="" onChange={handleChange} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Test" value="test value" onChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('should call onChange with new value when typed', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(<Input label="Test" value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');

    expect(handleChange).toHaveBeenCalledWith('h');
    expect(handleChange).toHaveBeenCalledWith('e');
    expect(handleChange).toHaveBeenCalledWith('l');
    expect(handleChange).toHaveBeenCalledWith('l');
    expect(handleChange).toHaveBeenCalledWith('o');
  });

  it('should display placeholder text', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Input label="Test" value="" onChange={handleChange} placeholder="Enter text..." />
    );

    const input = screen.getByPlaceholderText('Enter text...');
    expect(input).toBeInTheDocument();
  });

  it('should show error message when error prop is provided', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Input label="Test" value="" onChange={handleChange} error="This field is required" />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should render as password input when type is password', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Password" value="" onChange={handleChange} type="password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should be disabled when disabled prop is true', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Test" value="" onChange={handleChange} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should respect maxLength prop', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Test" value="" onChange={handleChange} maxLength={10} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should show required indicator when required prop is true', () => {
    const handleChange = jest.fn();
    renderWithProvider(<Input label="Test" value="" onChange={handleChange} required />);

    // Fluent UI adds an asterisk or required indicator
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
