import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.log('User not authenticated:', error);
    return redirect('/login');
  }
  console.log('Authenticated user:', data.user.email);


  return (
    <div>page, welcome {data.user.email}, {data.user.id}</div>
  )
}
