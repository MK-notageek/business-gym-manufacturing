import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import ThankYouPage from './pages/ThankYouPage'

function pickHeadlineVariant(): 'headline-30pct' | 'headline-10hrs' {
  if (typeof document === 'undefined') return 'headline-30pct'
  const m = document.cookie.match(/(?:^|;\s*)pba-variant=(headline-30pct|headline-10hrs)/)
  return (m?.[1] as 'headline-30pct' | 'headline-10hrs') ?? 'headline-30pct'
}

const headlineVariant = pickHeadlineVariant()

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadMagnetPage headlineVariant={headlineVariant} />} />
      <Route path="/a" element={<LeadMagnetPage headlineVariant="headline-30pct" />} />
      <Route path="/b" element={<LeadMagnetPage headlineVariant="headline-10hrs" />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  )
}
