import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function UserLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
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
    if (!validate()) return
    setSubmitting(true)
    // TODO: wire to auth API
    setTimeout(() => setSubmitting(false), 500)
  }

  return (
    <div className="min-h-screen bg-medical-mist bg-grid-pattern pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 text-sm font-semibold mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
          <h1 className="font-display font-bold text-2xl text-slate-900">User login</h1>
          <p className="mt-2 text-slate-600 text-sm">
            Sign in with your username and password.
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
        </div>
      </div>
    </div>
  )
}
