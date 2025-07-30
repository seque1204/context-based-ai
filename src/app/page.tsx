import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Search from '@/app/components/Search'
import React from 'react'

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.log('User not authenticated:', error);
    return redirect('/login');
  }
  console.log('Authenticated user:', data.user.email);


  return (
    <div className=" max-w-5xl mx-auto h-screen flex justify-center items-center">
      <div className=" w-full h-80vh rounded-sm shadow-sm border flex flex-col p-5">
        <Search />
      </div>
    </div>
  );
}
