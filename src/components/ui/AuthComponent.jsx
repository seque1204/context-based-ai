'use client'
import { signInWithGoogle } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export default function AuthComponent() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-96 border shadow-sm p-5 rounded-sm">
        <h1 className="font-bold text-lg">
          Welcome to the Login Page
        </h1>
        <p className="text-sm">
          Please log in to continue or sign up if you don't have an account.
        </p>
        <form action={signInWithGoogle}>
          <Button className="w-full bg-indigo-500" type="submit">
            Login with Google
          </Button>
        </form>
      </div>
    </div>
  )
}