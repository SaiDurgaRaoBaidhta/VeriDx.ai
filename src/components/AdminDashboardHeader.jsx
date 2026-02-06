import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../Images/logo.jpeg'
import { ADMIN_AUTH_KEY } from '../pages/AdminLogin'

export default function AdminDashboardHeader() {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    setProfileOpen(false)
    sessionStorage.removeItem(ADMIN_AUTH_KEY)
    navigate('/admin', { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-soft">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-left"
          >
            <img src={logo} alt="VeriDx.ai" className="w-10 h-10" />
            <div className="flex flex-col gap-0">
              <span className="font-display font-bold text-xl text-medical-navy tracking-tight leading-tight">
                VeriDx<span className="text-primary-600">.ai</span>
              </span>
              <span className="text-sm font-normal text-slate-500 tracking-tight leading-tight">
                Admin
              </span>
            </div>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-primary-600 transition-colors"
              aria-label="Profile"
              aria-expanded={profileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl bg-white border border-slate-200 shadow-lg z-50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors rounded-lg mx-1"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
