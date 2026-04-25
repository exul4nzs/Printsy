/**
 * Resolve product mockup URLs from the API (often `/media/...`) to an absolute URL
 * the browser can load. Falls back to a bundled SVG when missing.
 */
export function getApiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  return raw.replace(/\/?api\/?$/i, '').replace(/\/$/, '') || 'http://localhost:8000';
}

export function resolveMockupUrl(mockup?: string | null): string {
  if (!mockup?.trim()) return '/mockup-tshirt.svg';
  if (/^https?:\/\//i.test(mockup)) return mockup;
  const origin = getApiOrigin();
  return mockup.startsWith('/') ? `${origin}${mockup}` : `${origin}/${mockup}`;
}
