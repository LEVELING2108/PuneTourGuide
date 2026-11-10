import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Unit tests never touch the network: every request behaves as if the device were offline,
// which is also the state each screen must survive.
vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Network disabled in unit tests'))));

// jsdom's AbortSignal is not the one Node's Request accepts, and React Router builds a Request
// for every data-router navigation (e.g. a guest redirected from /plan to /login). Drop the
// signal in tests only.
const NativeRequest = globalThis.Request;
class TestRequest extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const { signal: _signal, ...rest } = init ?? {};
    void _signal;
    super(input, rest);
  }
}
vi.stubGlobal('Request', TestRequest);
