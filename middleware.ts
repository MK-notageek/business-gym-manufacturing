import { next } from '@vercel/edge'

export const config = {
  matcher: '/',
}

const COOKIE = 'pba-variant'
const ONE_YEAR = 60 * 60 * 24 * 365

export default function middleware(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  // Accept legacy 'a' / 'b' cookies so existing visitors aren't reshuffled.
  const match = cookieHeader.match(/(?:^|;\s*)pba-variant=(50k|500k|a|b)/)

  if (match) {
    return next()
  }

  const variant = Math.random() < 0.5 ? '50k' : '500k'
  const response = next()
  response.headers.append(
    'Set-Cookie',
    `${COOKIE}=${variant}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax; Secure`
  )
  return response
}
