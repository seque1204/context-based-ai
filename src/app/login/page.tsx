import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthComponent from '@/components/ui/AuthComponent'

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    console.log('User authenticated', data.session.user);
    return redirect('/');
  }
  console.log('Non Authenticated user');
  return (
    <AuthComponent />
  );
}