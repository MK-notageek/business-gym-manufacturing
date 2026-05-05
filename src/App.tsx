import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import LeadMagnetPageB from './pages/LeadMagnetPageB'
import ThankYouPage from './pages/ThankYouPage'

function pickVariant(): '50k' | '500k' {
  if (typeof document === 'undefined') return '50k'
  const m = document.cookie.match(/(?:^|;\s*)pba-variant=(50k|500k|a|b)/)
  const v = m?.[1]
  if (v === 'a') return '50k'
  if (v === 'b') return '500k'
  return (v as '50k' | '500k') ?? '50k'
}

const variant = pickVariant()

export default function App() {
  return (
    <Routes>
      <Route path="/" element={variant === '500k' ? <LeadMagnetPageB /> : <LeadMagnetPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  )
}
