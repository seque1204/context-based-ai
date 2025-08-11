import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Image from "next/image";
import Form from './components/Form';
import { BsDatabase } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #C5A572 100%)', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="bg-[#FAF7F2] shadow-lg rounded-3xl p-10 w-full max-w-xl space-y-6 border border-[#C5A572]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <BsDatabase className="w-12 h-12 text-[#C5A572]" />
            <h1 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Cinzel, \"Times New Roman\", serif' }}>VICI Database</h1>
          </div>
          <Link href="/" passHref>
            <Button variant="outline">
              ← Back to Home
            </Button>
          </Link>
        </div>
        <p className="text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
          Upload a PDF to add it to your organization’s  dataset.
        </p>
        <Form />
        
      </div>
    </div>
  );
}
