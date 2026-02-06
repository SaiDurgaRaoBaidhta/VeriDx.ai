import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin@123'
export const ADMIN_AUTH_KEY = 'veridx_admin_authenticated'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const next = {}
    if (!username.trim()) next.username = 'Username is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    const trimmedUser = username.trim()
    if (trimmedUser === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, '1')
      setSubmitting(false)
      navigate('/admin-dashboard')
      return
    }
    setSubmitError('Invalid username or password')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 text-sm font-semibold mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Admin role responsibilities */}
          <div className="lg:col-span-6 space-y-7">
            <div>
              <div className="badge">
                <span className="size-2 rounded-full bg-primary-600" />
                <span>Admin</span>
              </div>
              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Governance, access control, and compliance.
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                The admin role on the VeriDx.ai platform is responsible for safeguarding
                responsible, compliant, and defensible use of the platform.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="text-sm font-semibold text-slate-900">
                Admin responsibilities
              </div>
              <ul className="mt-4 grid gap-2.5 text-sm text-slate-600">
                <li>• Manage users and organizations</li>
                <li>• Review and approve medical expert panel applications</li>
                <li>• Oversee medical record uploads and access</li>
                <li>• Maintain audit logs for traceability</li>
                <li>• Ensure data security</li>
                <li>• Enforce privacy and usage policies</li>
                <li>• Monitor system health</li>
              </ul>
              <p className="mt-4 fineprint">
                Admins do not make medical or legal decisions; their role is to support
                governance and compliance only.
              </p>
            </div>
          </div>

          {/* Right: Login form */}
          <div className="lg:col-span-6">
            <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
              {submitError && (
                <p className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {submitError}
                </p>
              )}
              <h1 className="font-display font-bold text-2xl text-slate-900">Welcome Back</h1>
              <p className="mt-2 text-slate-600 text-sm">
                Login to your account to continue.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700">
                Username <span className="text-primary-600">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errors.username) setErrors((prev) => ({ ...prev, username: null }))
                }}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Password <span className="text-primary-600">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                }}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 px-4 py-4 font-bold text-white shadow-soft-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account ?{' '}
                <Link to="/admin/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                  sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
