import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import ThankYouPage from './pages/ThankYouPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadMagnetPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  )
}
