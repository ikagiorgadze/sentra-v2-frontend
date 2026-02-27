import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
}

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  // Recharts depends on this in tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ResizeObserver = ResizeObserverMock;
}

if (typeof window !== 'undefined') {
  const local = window.localStorage as Partial<Storage> | undefined;
  const session = window.sessionStorage as Partial<Storage> | undefined;
  if (!local || typeof local.getItem !== 'function' || typeof local.setItem !== 'function' || typeof local.removeItem !== 'function' || typeof local.clear !== 'function') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: createMemoryStorage(),
    });
  }
  if (!session || typeof session.getItem !== 'function' || typeof session.setItem !== 'function' || typeof session.removeItem !== 'function' || typeof session.clear !== 'function') {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      writable: true,
      value: createMemoryStorage(),
    });
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
