import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ConversationsPageClient from './ConversationsPageClient';
import React from 'react';
// This is the main page for the Conversations feature
// It checks if the user is authenticated and verified before rendering the client component

export default async function Page() {
  const supabase = await createClient();
  const {data} = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect('/home');
  }

  console.log('Authenticated user:', data.user.id);
  const { data: user } = await supabase
    .from("users")
    .select("Verified")
    .eq("id", data.user.id)
    .single();
  if (!user?.Verified) {
    console.log('User is not verified:', user?.Verified)
    return redirect('/auth/authorize');
  }

  return <ConversationsPageClient />;
}
