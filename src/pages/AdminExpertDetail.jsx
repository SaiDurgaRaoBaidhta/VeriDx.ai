import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSubmissions,
  getLocalSubmissions,
  getFileDownloadUrl,
  getLocalSubmissionCv,
} from '../lib/api'
import { getCvTextFromLocal, getCvTextFromUrl, extractKeyPoints } from '../lib/cvExtract'
import { ADMIN_AUTH_KEY } from './AdminLogin'
import AdminDashboardHeader from '../components/AdminDashboardHeader'

export default function AdminExpertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [keyPoints, setKeyPoints] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cvExpired, setCvExpired] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(ADMIN_AUTH_KEY)) {
      navigate('/admin', { replace: true })
      return
    }
    let cancelled = false
    async function load() {
      const fromApi = await getSubmissions()
      let record = null
      if (fromApi && Array.isArray(fromApi)) {
        record = fromApi.find((s) => s.id === id)
      }
      if (!record) {
        const local = getLocalSubmissions()
        record = local.find((s) => s.id === id)
      }
      if (cancelled) return
      if (!record) {
        navigate('/admin-dashboard', { replace: true })
        return
      }
      setSubmission(record)

      let cvText = ''
      const localCv = getLocalSubmissionCv(id)
      if (localCv) {
        cvText = await getCvTextFromLocal(localCv)
      } else if (record.hasFile && getFileDownloadUrl(id)) {
        cvText = await getCvTextFromUrl(getFileDownloadUrl(id))
      } else {
        setCvExpired(true)
      }
      if (cancelled) return
      const points = extractKeyPoints(cvText, record.name || '')
      setKeyPoints(points)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id, navigate])

  if (!sessionStorage.getItem(ADMIN_AUTH_KEY)) return null
  if (loading || !submission) {
    return (
      <div className="min-h-screen bg-medical-mist bg-grid-pattern">
        <AdminDashboardHeader />
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-12 text-slate-500">
            {!submission ? 'Redirecting…' : 'Loading CV key points…'}
          </div>
        </main>
      </div>
    )
  }

  const k = keyPoints || {}
  const hasCvContent = k.experience || k.education || k.qualifications || k.skills || k.age
  const hasStoredSummary = submission.cvSummary && String(submission.cvSummary).trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 ">
      <AdminDashboardHeader />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 text-sm font-semibold mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to experts
          </button>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft-lg">
            <h1 className="font-display font-bold text-2xl text-medical-navy">
              Summarized CV
            </h1>

            {hasStoredSummary && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-2">Stored CV summary</h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.cvSummary}</p>
              </div>
            )}

            <dl className="mt-8 space-y-6">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Name</dt>
                <dd className="mt-1 font-medium text-slate-900">{submission.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Email</dt>  
                <dd className="mt-1 text-slate-700">{submission.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Phone number</dt>
                <dd className="mt-1 text-slate-700">{submission.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Age / Date of birth</dt>
                <dd className="mt-1 text-slate-700">{k.age || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Qualifications</dt>
                <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{k.qualifications || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Education</dt>
                <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{k.education || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-700 font-semibold">Experience</dt>
                <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{k.experience || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-slate-900 font-bold">Skills</dt>
                <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{k.skills || '—'}</dd>
              </div>
            </dl>

            {cvExpired && !hasCvContent && (
              <p className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                CV file is no longer available (storage expired after 10 hours). Contact and submission details are shown above.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
