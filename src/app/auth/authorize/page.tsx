"use client";
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Authorize() {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check verification status in your users table
          const { data: userData } = await supabase
            .from("users")
            .select("Verified")
            .eq("id", user.id)
            .single()

          if (userData?.Verified) {
            // User is verified, redirect to main page
            router.push('/')
            return
          }
        }
      } catch (error) {
        console.error('Error checking verification:', error)
      }
    }

    // Check immediately
    checkVerification()

    // Set up polling every 3 seconds
    const interval = setInterval(checkVerification, 3000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [router, supabase])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">
          Pending authorization, please wait...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">
          We're checking your verification status...
        </p>
      </div>
    </div>
  )
}