import { next } from '@vercel/edge'

export const config = {
  matcher: '/',
}

const COOKIE = 'pba-variant'
const ONE_YEAR = 60 * 60 * 24 * 365

export default function middleware(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)pba-variant=(headline-30pct|headline-10hrs)/)

  if (match) {
    return next()
  }

  // New visitor or legacy cookie — assign to headline A/B test.
  const variant = Math.random() < 0.5 ? 'headline-30pct' : 'headline-10hrs'
  const response = next()
  response.headers.append(
    'Set-Cookie',
    `${COOKIE}=${variant}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax; Secure`
  )
  return response
}
