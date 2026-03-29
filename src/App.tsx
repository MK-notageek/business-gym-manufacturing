import { Routes, Route } from 'react-router-dom'
import LeadMagnetPage from './pages/LeadMagnetPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadMagnetPage />} />
    </Routes>
  )
}
