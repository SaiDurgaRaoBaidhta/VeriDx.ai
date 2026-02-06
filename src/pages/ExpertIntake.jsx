import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ExpertIntake() {
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
    // TODO: wire to login API
    setTimeout(() => setSubmitting(false), 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50  pt-24 pb-20 px-4 sm:px-6 lg:px-8">
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
          {/* Left: Content (unchanged matter) */}
          <div className="lg:col-span-6 space-y-7">
            <div>
              <div className="badge">
                <span className="size-2 rounded-full bg-primary-600" />
                <span>Medical Expert Panel intake</span>
              </div>
              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Share your details to be considered for our confidential panel.
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                Engagements with medical experts are selective and case-based. All fields
                below are required so our team can understand your background and areas of
                expertise.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="text-sm font-semibold text-slate-900">
                How we work with experts
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Participation on the VeriDx.ai Medical Expert Panel is not automatic. This
                intake helps us understand your clinical background, specialties, and
                experience with medical malpractice or documentation review.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-slate-600">
                <li>• Focus on documentation quality and medical evidence</li>
                <li>• Engagements scoped to specific cases and questions</li>
                <li>• Materials and discussions handled confidentially</li>
              </ul>
              <p className="mt-4 fineprint">
                Completing this form does not create an engagement, attorney-client
                relationship, or guarantee future work.
              </p>
            </div>
          </div>

          {/* Right: Login form */}
          <div className="lg:col-span-6 mt-20">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                Not a member ?{' '}
                <Link to="/expert-intake/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                  Be one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
