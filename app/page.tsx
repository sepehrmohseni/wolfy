import { createSupabaseServer } from '@/lib/supabase/server';
import { MainApp } from './components/MainApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialUser = null;
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      initialUser = {
        id: user.id,
        email: user.email!,
        verified: !!user.email_confirmed_at,
      };
    }
  } catch {
    // Not authenticated
  }

  return <MainApp initialUser={initialUser} />;
}
