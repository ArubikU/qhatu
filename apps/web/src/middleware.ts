import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth tokens live in localStorage (client-side only).
// Middleware cannot read localStorage — protection is handled inside each
// protected page component via useAuthStore + useRouter.replace('/login').
// This middleware is a pass-through but provides the correct matcher so Next.js
// does not accidentally skip the layout for protected routes.
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public assets (png, jpg, svg…)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)',
  ],
}
