import { next } from '@vercel/edge'

export const config = {
  matcher: '/',
}

const COOKIE = 'pba-variant'
const ONE_YEAR = 60 * 60 * 24 * 365

export default function middleware(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)pba-variant=(a|b)/)

  if (match) {
    return next()
  }

  const variant = Math.random() < 0.5 ? 'a' : 'b'
  const response = next()
  response.headers.append(
    'Set-Cookie',
    `${COOKIE}=${variant}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax; Secure`
  )
  return response
}
