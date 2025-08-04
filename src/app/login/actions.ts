'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    }
  })
  if (error) {
    redirect('/error')
  }
  console.log('Redirecting to:', data.url)
  redirect(data.url)
  
}