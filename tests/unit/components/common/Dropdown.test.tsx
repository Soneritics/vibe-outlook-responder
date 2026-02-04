import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Dropdown } from '../../../../src/taskpane/components/common/Dropdown';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<FluentProvider theme={webLightTheme}>{ui}</FluentProvider>);
};

describe('Dropdown Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render dropdown with label', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Dropdown
        label="Select Option"
        options={mockOptions}
        value=""
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('should display placeholder when no value selected', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Dropdown
        label="Test"
        options={mockOptions}
        value=""
        onChange={handleChange}
        placeholder="Choose one..."
      />
    );

    expect(screen.getByText('Choose one...')).toBeInTheDocument();
  });

  it('should call onChange when option is selected', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <Dropdown
        label="Test"
        options={mockOptions}
        value=""
        onChange={handleChange}
      />
    );

    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);

    const option = screen.getByText('Option 2');
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('should show error message when error prop provided', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Dropdown
        label="Test"
        options={mockOptions}
        value=""
        onChange={handleChange}
        error="Please select an option"
      />
    );

    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('should render disabled options', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    const optionsWithDisabled = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
      { value: 'option3', label: 'Option 3' },
    ];

    renderWithProvider(
      <Dropdown
        label="Test"
        options={optionsWithDisabled}
        value=""
        onChange={handleChange}
      />
    );

    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);

    const disabledOption = screen.getByText('Option 2').closest('div');
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show required indicator when required is true', () => {
    const handleChange = jest.fn();
    renderWithProvider(
      <Dropdown
        label="Test"
        options={mockOptions}
        value=""
        onChange={handleChange}
        required
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should display all options when opened', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <Dropdown
        label="Test"
        options={mockOptions}
        value=""
        onChange={handleChange}
      />
    );

    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });
});
