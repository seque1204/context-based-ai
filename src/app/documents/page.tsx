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

  // const { data: user } = await supabase
  //   .from("users")
  //   .select("role")
  //   .eq("id", data.user.id)
  //   .single()

  // if (!user?.role || !/admin/i.test(user.role)) {
  //   console.log('User is not an admin:', user?.role)
  //   return redirect('/')
  // }
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BsDatabase className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Daily AI Dataset</h1>
      </div>
      <p className="text-gray-500 mb-2">
        Upload a PDF to add it to your organization’s AI dataset.
      </p>
      <Form />
    </div>
  </div>
);
}
