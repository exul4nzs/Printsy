import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { registerAuthTokenGetter } from '@/lib/api';

describe('api auth interceptor', () => {
  beforeEach(() => {
    registerAuthTokenGetter(async () => 'test-firebase-token');
  });

  it('attaches Authorization bearer header when a token is available', async () => {
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    api.defaults.adapter = adapter;
    await api.get('/auth/user/');

    expect(adapter).toHaveBeenCalled();
    const config = adapter.mock.calls[0][0];
    expect(config.headers.Authorization).toBe('Bearer test-firebase-token');
  });
});
