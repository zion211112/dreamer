import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock 'use-sync-external-store' to use preact/compat's implementation
vi.mock('use-sync-external-store', async () => {
  const preactCompat = await import('preact/compat');
  return {
    useSyncExternalStore: preactCompat.useSyncExternalStore,
  };
});

vi.mock('use-sync-external-store/shim', async () => {
  const preactCompat = await import('preact/compat');
  return {
    useSyncExternalStore: preactCompat.useSyncExternalStore,
  };
});

vi.mock('use-sync-external-store/shim/index.js', async () => {
  const preactCompat = await import('preact/compat');
  return {
    useSyncExternalStore: preactCompat.useSyncExternalStore,
  };
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
