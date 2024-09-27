// src/setupTests.ts
import '@testing-library/jest-dom';

// Optional: Suppress specific deprecation warnings
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (msg, ...args) => {
    if (msg.includes('The `punycode` module is deprecated')) return;
    originalConsoleWarn(msg, ...args);
  };

  // Mock scrollIntoView to prevent errors in tests
  Element.prototype.scrollIntoView = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});
