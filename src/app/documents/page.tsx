import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { BsDatabase } from "react-icons/bs";
import Form from './components/Form';


export default async function Page() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('User not authenticated:', error)
    redirect('/login')
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (user?.role !== 'admin') {
    console.log('User is not an admin:', user?.role)
    return redirect('/')
  }
  return (
    <div className="max-w-4xl mx-auto h-screen flex justify-center items-center">
			<div className="w-full p-5 space-y-3">
				<div className="flex items-center gap-2">
					<BsDatabase className="w-5 h-5" />
					<h1>Daily AI dataset</h1>
				</div>
				<Form />
			</div>
		</div>
	);
}
