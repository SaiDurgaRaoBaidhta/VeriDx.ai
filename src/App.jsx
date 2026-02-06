import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ExpertIntake from './pages/ExpertIntake'
import ExpertIntakeSignup from './pages/ExpertIntakeSignup'
import UserLogin from './pages/UserLogin'
import AdminLogin from './pages/AdminLogin'
import AdminSignup from './pages/AdminSignup'
import AdminDashboard from './pages/AdminDashboard'
import AdminExpertDetail from './pages/AdminExpertDetail'

function AppLayout() {
  const location = useLocation()
  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard')

  return (
    <>
      {!isAdminDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/expert-intake" element={<ExpertIntake />} />
        <Route path="/expert-intake/signup" element={<ExpertIntakeSignup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/expert/:id" element={<AdminExpertDetail />} />
      </Routes>
      {!isAdminDashboard && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
