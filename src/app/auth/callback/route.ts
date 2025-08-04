import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.redirect('/login')
  }
  const supabase = await createClient()
  await supabase.auth.exchangeCodeForSession(code)
  // Optionally, you can check the user here:
  const { data } = await supabase.auth.getUser()
  
  // Check user role in the database
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("Verified")
    .eq("id", data?.user?.id)  // Match by user ID
    .single()

  if (userError || !user?.Verified) {
    console.log('User is not verified:', user?.Verified)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/auth/authorize`)
  }

  // If verified, redirect to home
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/`)

  
}