export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.warn('TURNSTILE_SECRET not set, skipping verification in dev');
    return process.env.NODE_ENV === 'development';
  }

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form }
  );

  const data = await res.json();
  return data.success === true;
}
