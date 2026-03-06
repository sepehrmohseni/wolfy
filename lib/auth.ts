import { createSupabaseServer } from './supabase/server';

export async function requireVerifiedUser(): Promise<
  { id: string; email: string } | { error: string; status: number }
> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Unauthorized. Please sign in.', status: 401 };
  }

  if (!user.email_confirmed_at) {
    return { error: 'Please verify your email before generating.', status: 403 };
  }

  return { id: user.id, email: user.email! };
}
