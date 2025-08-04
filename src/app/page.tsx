import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Search from './components/Search'
import React from 'react'

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.log('User not authenticated:', error);
    return redirect('/login');
  }
  console.log('Authenticated user:', data.user.email);

  const { data: user } = await supabase
    .from("users")
    .select("Verified")
    .eq("id", data.user.id)
    .single();
  if (!user?.Verified) {
    console.log('User is not verified:', user?.Verified)
    return redirect('/auth/authorize');
  }


  return (
    <div className=" h-screen flex justify-center">
      <div className="max-w-5xl w-full h-80vh rounded-sm shadow-sm border flex flex-col p-5 ">
        <Search />
      </div>
    </div>
  );
}
