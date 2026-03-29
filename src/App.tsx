import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'
import DirectBookingPage from './pages/DirectBookingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadMagnetPage />} />
      <Route path="/book" element={<DirectBookingPage />} />
    </Routes>
  )
}
