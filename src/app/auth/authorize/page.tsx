"use client";
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Authorize() {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const setupRealTimeSubscription = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check initial verification status
        const { data: userData } = await supabase
          .from("users")
          .select("Verified")
          .eq("id", user.id)
          .single()

        if (userData?.Verified) {
          router.push('/')
          return
        }

        // Subscribe to real-time changes on YOUR users table
        const subscription = supabase
          .channel(`user-verification-${user.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',           // Listen for updates
            schema: 'public',          // Your database schema
            table: 'users',            // YOUR custom users table
            filter: `id=eq.${user.id}` // Only for this specific user
          }, (payload) => {
            console.log('Real-time update received:', payload)
            // When Verified changes to true, redirect
            if (payload.new.Verified === true) {
              router.push('/')
            }
          })
          .subscribe()

        // Cleanup subscription
        return () => {
          subscription.unsubscribe()
        }
      }
    }

    setupRealTimeSubscription()
  }, [router, supabase])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">
          Pending authorization, please wait...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-4">
          We're waiting for approval...
        </p>
      </div>
    </div>
  )
}