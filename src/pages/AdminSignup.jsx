import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminSignup } from '../lib/api'
import { ADMIN_AUTH_KEY } from './AdminLogin'

export default function AdminSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    if (submitError) setSubmitError(null)
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = 'Username is required'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    const result = await adminSignup({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    setSubmitting(false)
    if (result.ok) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, '1')
      navigate('/admin-dashboard')
      return
    }
    setSubmitError(result.error || 'Sign up failed. Please try again.')
  }

  return (
    <div className="min-h-screen bg-medical-mist bg-grid-pattern pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 text-sm font-semibold mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to admin login
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

          {/* Right: Sign up form */}
          <div className="lg:col-span-6">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
              {submitError && (
                <p className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {submitError}
                </p>
              )}
              <h1 className="font-display font-bold text-2xl text-slate-900">sign up</h1>
              <p className="mt-2 text-slate-600 text-sm">
                Create an account to continue.
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
                value={form.username}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                Email <span className="text-primary-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.email}</p>
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
                value={form.password}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">
                Confirm password <span className="text-primary-600">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 font-medium shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 px-4 py-4 font-bold text-white shadow-soft-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing up…' : 'Sign up'}
            </button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
