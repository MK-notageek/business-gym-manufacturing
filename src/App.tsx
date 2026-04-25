import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import LeadMagnetPageB from './pages/LeadMagnetPageB'
import ThankYouPage from './pages/ThankYouPage'

function pickVariant(): 'a' | 'b' {
  if (typeof document === 'undefined') return 'a'
  const m = document.cookie.match(/(?:^|;\s*)pba-variant=(a|b)/)
  return (m?.[1] as 'a' | 'b') ?? 'a'
}

const variant = pickVariant()

export default function App() {
  return (
    <Routes>
      <Route path="/" element={variant === 'b' ? <LeadMagnetPageB /> : <LeadMagnetPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  )
}
