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
  const { data, error } = await supabase.auth.getUser()
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/private`)
}