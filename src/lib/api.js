const API_BASE = import.meta.env.VITE_API_URL || ''

export async function getSubmissions() {
  if (!API_BASE) return null
  try {
    const res = await fetch(`${API_BASE}/api/expert-intake`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function submitExpertIntake(formData) {
  if (!API_BASE) return { ok: false, fallback: true }
  try {
    const res = await fetch(`${API_BASE}/api/expert-intake`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err.error || res.statusText }
    }
    const data = await res.json()
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message, fallback: true }
  }
}

export function getFileDownloadUrl(id) {
  if (!API_BASE) return null
  return `${API_BASE}/api/expert-intake/${id}/file`
}

export const STORAGE_KEY = 'veridx_expert_submissions'
const CV_STORAGE_PREFIX = 'veridx_cv_'
const CV_EXPIRY_HOURS = 10

export function getLocalSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      resolve(typeof result === 'string' ? result.split(',')[1] : '')
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function saveLocalCv(submissionId, file) {
  try {
    const base64 = await fileToBase64(file)
    const expiry = Date.now() + CV_EXPIRY_HOURS * 60 * 60 * 1000
    const payload = { base64, expiry, fileName: file.name || '' }
    localStorage.setItem(CV_STORAGE_PREFIX + submissionId, JSON.stringify(payload))
  } catch (e) {
    console.error('Failed to store CV locally', e)
  }
}

export function getLocalSubmissionCv(submissionId) {
  try {
    const raw = localStorage.getItem(CV_STORAGE_PREFIX + submissionId)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.expiry && Date.now() > data.expiry) {
      localStorage.removeItem(CV_STORAGE_PREFIX + submissionId)
      return null
    }
    return data
  } catch {
    return null
  }
}

export async function saveLocalSubmission(entry, file) {
  const list = getLocalSubmissions()
  const id = entry.id || `local-${Date.now()}`
  const record = { ...entry, id, hasFile: !!file }
  list.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  if (file) await saveLocalCv(id, file)
  return id
}

export async function deleteSubmission(id) {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/expert-intake/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.error || res.statusText }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message, fallback: true }
    }
  }
  // Fallback to localStorage
  try {
    const list = getLocalSubmissions()
    const filtered = list.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
