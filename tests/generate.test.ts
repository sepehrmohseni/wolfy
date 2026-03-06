import { verifyTurnstile } from '../lib/turnstile';

// Mock fetch
global.fetch = jest.fn();

describe('Turnstile verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (global.fetch as jest.Mock).mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns true on successful verification', async () => {
    process.env.TURNSTILE_SECRET = 'test-secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true }),
    });

    const result = await verifyTurnstile('valid-token', '127.0.0.1');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns false on failed verification', async () => {
    process.env.TURNSTILE_SECRET = 'test-secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: false }),
    });

    const result = await verifyTurnstile('invalid-token');
    expect(result).toBe(false);
  });

  it('skips verification in dev when no secret', async () => {
    delete process.env.TURNSTILE_SECRET;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

    const result = await verifyTurnstile('any-token');
    expect(result).toBe(true);
  });
});
