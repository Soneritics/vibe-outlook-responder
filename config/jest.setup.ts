import '@testing-library/jest-dom';

// Mock Office.js
global.Office = {
  context: {
    mailbox: {
      item: {},
    },
    roamingSettings: new Map(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReady: jest.fn(() => Promise.resolve()) as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
