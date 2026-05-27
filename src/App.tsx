import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import ThankYouPage from './pages/ThankYouPage'

function pickHeadlineVariant(): 'headline-profit' | 'headline-10hrs' {
  if (typeof document === 'undefined') return 'headline-profit'
  const m = document.cookie.match(/(?:^|;\s*)pba-variant=(headline-profit|headline-10hrs)/)
  return (m?.[1] as 'headline-profit' | 'headline-10hrs') ?? 'headline-profit'
}

const headlineVariant = pickHeadlineVariant()

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadMagnetPage headlineVariant={headlineVariant} />} />
      <Route path="/a" element={<LeadMagnetPage headlineVariant="headline-profit" />} />
      <Route path="/b" element={<LeadMagnetPage headlineVariant="headline-10hrs" />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  )
}
