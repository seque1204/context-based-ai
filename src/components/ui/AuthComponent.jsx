'use client'
import { signInWithGoogle } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'

export default function AuthComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-slate-800/60 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-10 shadow-2xl shadow-cyan-900/30 relative overflow-hidden">
          {/* Glassmorphism Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-cyan-500/25">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Sign in to your account to continue building amazing projects
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-7">
            <form action={signInWithGoogle} className="w-full">
              <Button 
                type="submit"
                className="w-full h-12 bg-white text-cyan-700 font-semibold rounded-xl shadow-md hover:bg-cyan-50 transition-all duration-200 flex items-center justify-center gap-3 border border-cyan-100"
              >
                {/* Google SVG */}
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.23l6.92-6.92C36.68 2.7 30.73 0 24 0 14.82 0 6.73 5.8 2.69 14.09l8.06 6.26C12.7 13.23 17.88 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.21-.43-4.73H24v9.01h12.41c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.38 46.1 24.55z"/>
                    <path fill="#FBBC05" d="M10.75 28.35A14.5 14.5 0 0 1 9.5 24c0-1.52.25-2.99.7-4.35l-8.06-6.26A23.97 23.97 0 0 0 0 24c0 3.77.9 7.34 2.49 10.46l8.26-6.11z"/>
                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.84l-7.19-5.6c-2.01 1.35-4.59 2.16-8.71 2.16-6.12 0-11.3-3.73-13.25-9.01l-8.26 6.11C6.73 42.2 14.82 48 24 48z"/>
                  </g>
                </svg>
                Continue with Google
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              <span className="px-4 bg-slate-800/80 text-cyan-400 font-medium rounded-full shadow text-xs tracking-wide border border-cyan-500/10">
                Secure authentication
              </span>
              <div className="flex-grow h-px bg-gradient-to-l from-transparent via-cyan-500/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            By signing in, you agree to our{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}