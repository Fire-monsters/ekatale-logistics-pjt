import { resolveApiHost } from './index';

describe('resolveApiHost', () => {
  it('prefers an explicit Expo public host override', () => {
    expect(
      resolveApiHost({
        envHost: '10.10.10.25',
        debuggerHost: '192.168.1.50:8081',
        extraHost: '172.16.0.10',
      }),
    ).toBe('10.10.10.25');
  });

  it('uses the Expo debugger host when available', () => {
    expect(resolveApiHost({ debuggerHost: '192.168.1.50:8081' })).toBe('192.168.1.50');
  });

  it('falls back to the configured extra host', () => {
    expect(resolveApiHost({ extraHost: '172.16.0.10' })).toBe('172.16.0.10');
  });

  it('uses the default fallback host', () => {
    expect(resolveApiHost({})).toBe('192.168.0.27');
  });
});
