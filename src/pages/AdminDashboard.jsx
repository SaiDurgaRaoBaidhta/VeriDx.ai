import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSubmissions, getLocalSubmissions, getFileDownloadUrl, deleteSubmission } from '../lib/api'
import { ADMIN_AUTH_KEY } from './AdminLogin'
import logo from '../Images/logo.jpeg'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const rowMenuRefs = useRef({})
  const [list, setList] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [rowMenuOpen, setRowMenuOpen] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadList = async () => {
    const fromApi = await getSubmissions()
    if (fromApi && Array.isArray(fromApi)) {
      setList(fromApi)
      setSource('api')
    } else {
      setList(getLocalSubmissions())
      setSource('local')
    }
  }

  useEffect(() => {
    if (!sessionStorage.getItem(ADMIN_AUTH_KEY)) {
      navigate('/admin', { replace: true })
      return
    }
    let cancelled = false
    async function load() {
      await loadList()
      if (cancelled) return
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [navigate])

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

  useEffect(() => {
    function handleClickOutsideRowMenu(e) {
      if (rowMenuOpen === null) return
      const ref = rowMenuRefs.current[rowMenuOpen]
      if (ref && !ref.contains(e.target)) setRowMenuOpen(null)
    }
    document.addEventListener('mousedown', handleClickOutsideRowMenu)
    return () => document.removeEventListener('mousedown', handleClickOutsideRowMenu)
  }, [rowMenuOpen])

  const handleDeleteExpert = async (id) => {
    setRowMenuOpen(null)
    if (!confirm('Remove this expert from the list?')) return
    setDeletingId(id)
    const result = await deleteSubmission(id)
    setDeletingId(null)
    if (result.ok) {
      await loadList()
    } else {
      alert(result.error || 'Failed to remove expert')
    }
  }

  if (!sessionStorage.getItem(ADMIN_AUTH_KEY)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 ">
      {/* Dashboard navbar: logo left, VeriDx.ai + Admin (tagline) right; profile dropdown */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-soft">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 md:h-20">
            <div className="flex items-center gap-2">
              {/* <span className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                
              </span> */}
              <img src={logo} alt="VeriDx.ai" className="w-10 h-10 " />
              <div className="flex flex-col gap-0">
                <span className="font-display font-bold text-xl text-medical-navy tracking-tight leading-tight">
                  VeriDx<span className="text-primary-600">.ai</span>
                </span>
                <span className="text-sm font-normal text-slate-500 tracking-tight leading-tight">
                  Admin
                </span>
              </div>
            </div>

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

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-medical-navy">
              Experts intaken
            </h1>
            <p className="mt-2 text-slate-600 text-base">
              Medical expert panel applications and intake submissions.
            </p>

            {loading ? (
              <p className="mt-8 text-slate-500">Loading…</p>
            ) : list.length === 0 ? (
              <p className="mt-8 text-slate-500">No experts intaken yet.</p>
            ) : (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phone number
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        CV
                      </th>
                      <th className="pb-3 w-10" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-4 pr-4 font-medium text-slate-800">{row.name || '—'}</td>
                        <td className="py-4 pr-4 text-slate-600">{row.email || '—'}</td>
                        <td className="py-4 pr-4 text-slate-600">{row.phone || '—'}</td>
                        <td className="py-4 pr-4">
                          {(row.cvFileName || row.hasFile) ? (
                            <Link
                              to={`/admin-dashboard/expert/${row.id}`}
                              className="text-primary-600 font-semibold hover:underline"
                            >
                              {row.cvFileName || 'View CV'}
                            </Link>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 relative">
                          <div
                            ref={(el) => { rowMenuRefs.current[row.id] = el }}
                            className="relative inline-block"
                          >
                            <button
                              type="button"
                              onClick={() => setRowMenuOpen(rowMenuOpen === row.id ? null : row.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              aria-label="Row actions"
                              aria-expanded={rowMenuOpen === row.id}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <circle cx="12" cy="6" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="18" r="1.5" />
                              </svg>
                            </button>
                            {rowMenuOpen === row.id && (
                              <div className="absolute right-7 -bottom-1 min-w-[120px] rounded-xl bg-white border border-slate-200 shadow-lg z-50">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpert(row.id)}
                                  disabled={deletingId === row.id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1 disabled:opacity-50"
                                >
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {deletingId === row.id ? 'Removing…' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
