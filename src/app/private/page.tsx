import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('User not authenticated:', error)
    redirect('/login')
  }
  console.log('Authenticated user:', data.user)
  return <p>Hello {data.user.email}</p>
}
