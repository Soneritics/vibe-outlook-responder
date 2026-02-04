import '@testing-library/jest-dom';

// Polyfill fetch for OpenAI SDK in Jest environment
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Mock Office.js AsyncResultStatus enum
const AsyncResultStatus = {
  Succeeded: 'succeeded' as const,
  Failed: 'failed' as const,
};

// Mock Office.js
global.Office = {
  context: {
    mailbox: {
      item: {
        body: {
          getAsync: jest.fn((type, callback) => {
            callback({
              status: AsyncResultStatus.Succeeded,
              value: '<html><body>Test email content</body></html>',
            });
          }),
          setAsync: jest.fn((body, options, callback) => {
            if (callback) {
              callback({ status: AsyncResultStatus.Succeeded });
            } else if (typeof options === 'function') {
              options({ status: AsyncResultStatus.Succeeded });
            }
          }),
          prependAsync: jest.fn((body, options, callback) => {
            if (callback) {
              callback({ status: AsyncResultStatus.Succeeded });
            } else if (typeof options === 'function') {
              options({ status: AsyncResultStatus.Succeeded });
            }
          }),
        },
        subject: 'Test Subject',
        from: { emailAddress: 'sender@example.com', displayName: 'Sender Name' },
        dateTimeCreated: new Date(),
      },
    },
    roamingSettings: {
      _data: {} as Record<string, unknown>,
      get: jest.fn(function (this: { _data: Record<string, unknown> }, key: string) {
        return this._data[key];
      }),
      set: jest.fn(function (
        this: { _data: Record<string, unknown> },
        key: string,
        value: unknown
      ) {
        this._data[key] = value;
      }),
      remove: jest.fn(function (this: { _data: Record<string, unknown> }, key: string) {
        delete this._data[key];
      }),
      saveAsync: jest.fn((callback: (result: { status: string }) => void) => {
        setImmediate(() => {
          callback({ status: AsyncResultStatus.Succeeded });
        });
      }),
    },
  },
  AsyncResultStatus,
  CoercionType: {
    Html: 'html' as const,
    Text: 'text' as const,
  },
  onReady: jest.fn(() => Promise.resolve()),
} as unknown as typeof Office;

// Mock ResizeObserver for Fluent UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
