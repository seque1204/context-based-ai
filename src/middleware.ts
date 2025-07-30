/* Checks if the user is authenticated, if not redirect to login */
import { type NextRequest } from 'next/server'
import { updateSession } from 'src/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/private/:path*',
  ],
}