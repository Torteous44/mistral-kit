import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

declare global {
  // React 19 requires this flag so act()/waitFor flush updates in tests
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

if (!Object.prototype.hasOwnProperty.call(globalThis, 'IS_REACT_ACT_ENVIRONMENT')) {
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    configurable: true,
    get() {
      return true;
    },
    set() {
      // React Testing Library also sets this flag; keep it writable but locked to true
    },
  });
} else {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});
