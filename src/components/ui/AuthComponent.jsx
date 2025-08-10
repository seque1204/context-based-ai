'use client'
import { signInWithGoogle } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'
import Image from 'next/image'
export default function AuthComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FAF7F2] via-[#C5A572]/10 to-[#C5A574]/30" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-[#FAF7F2] backdrop-blur-2xl border border-[#8B0000] rounded-3xl p-10 shadow-2xl shadow-[#C5A572]/20 relative overflow-hidden">
          {/* Gold Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C5A572]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C5A574]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#C5A572] to-[#C5A574] rounded-2xl mb-6 shadow-lg shadow-[#C5A572]/25">
              <Image src="/VICILogo.png" alt="VICI Logo" width={56} height={56} className="w-14 h-14 object-contain" priority />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1A1A1A] mb-2 tracking-tight" style={{ fontFamily: 'Cinzel, \"Times New Roman\", serif' }}>
              Welcome Back
            </h1>
            <p className="text-[#1A1A1A] text-base leading-relaxed" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-7">
            <form action={signInWithGoogle} className="w-full">
              <Button
                type="submit"
                className="w-full h-12 bg-[#C5A572] text-[#1A1A1A] font-semibold rounded-xl shadow-md hover:bg-[#C5A574]/80 transition-all duration-200 flex items-center justify-center gap-3 border border-[#C5A572]/30"
                style={{ fontFamily: 'Inter, Arial, sans-serif' }}
              >
                {/* Google SVG */}
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.23l6.92-6.92C36.68 2.7 30.73 0 24 0 14.82 0 6.73 5.8 2.69 14.09l8.06 6.26C12.7 13.23 17.88 9.5 24 9.5z" />
                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.21-.43-4.73H24v9.01h12.41c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.38 46.1 24.55z" />
                    <path fill="#FBBC05" d="M10.75 28.35A14.5 14.5 0 0 1 9.5 24c0-1.52.25-2.99.7-4.35l-8.06-6.26A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.49 10.46l8.26-6.11z" />
                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.84l-7.19-5.6c-2.01 1.35-4.59 2.16-8.71 2.16-6.12 0-11.3-3.73-13.25-9.01l-8.26 6.11C6.73 42.2 14.82 48 24 48z" />
                  </g>
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#8B0000]/40 to-transparent" />
              <span className="px-4 bg-[#FAF7F2] text-[#8B0000] font-medium rounded-full shadow text-xs tracking-wide border border-[#8B0000]/10" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                Secure authentication
              </span>
              <div className="flex-grow h-px bg-gradient-to-l from-transparent via-[#8B0000]/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#1A1A1A] text-xs" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#C5A572] hover:text-[#8B0000] underline underline-offset-2 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#C5A572] hover:text-[#8B0000] underline underline-offset-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}