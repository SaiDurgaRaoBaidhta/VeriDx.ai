import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

if (typeof pdfjsWorker === 'string') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
}

export async function extractTextFromPdf(arrayBuffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    let text = ''
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }
    return text
  } catch (e) {
    console.error('PDF text extraction failed', e)
    return ''
  }
}

function base64ToUint8Array(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function extractKeyPoints(text, submissionName = '') {
  const t = (text || '').toLowerCase()
  const lines = (text || '').split(/\n/).map((s) => s.trim()).filter(Boolean)
  const result = {
    name: submissionName || '',
    age: null,
    qualifications: null,
    experience: null,
    education: null,
    skills: null,
    summary: null,
  }

  const sectionRegex = (title) => new RegExp(`\\b${title}\\b[\\s:]*([\\s\\S]*?)(?=\\n\\s*[A-Z][a-z]+:|$)`, 'i')
  const trySection = (key, ...titles) => {
    for (const title of titles) {
      const m = text.match(sectionRegex(title))
      if (m && m[1]) {
        const val = m[1].replace(/\s+/g, ' ').trim().slice(0, 500)
        if (val) result[key] = val
        return
      }
    }
  }

  trySection('experience', 'experience', 'work experience', 'employment', 'professional experience')
  trySection('education', 'education', 'academic', 'qualifications', 'degrees')
  trySection('qualifications', 'qualifications', 'certifications', 'credentials')
  trySection('skills', 'skills', 'core competencies', 'expertise')

  const ageMatch = text.match(/(?:age|dob|date of birth|year of birth|y\.o\.?|years old)[\s:]*(\d{1,3})/i)
  if (ageMatch) result.age = ageMatch[1]
  const dobMatch = text.match(/(?:dob|date of birth|d\.o\.b\.?)[\s:]*([^\n]+)/i)
  if (dobMatch && !result.age) result.age = dobMatch[1].trim().slice(0, 50)

  if (!result.qualifications && result.education) result.qualifications = result.education
  if (!result.experience && t.includes('experience')) {
    const idx = lines.findIndex((l) => /experience/i.test(l))
    if (idx >= 0 && lines[idx + 1]) result.experience = lines.slice(idx + 1).join(' ').slice(0, 500)
  }

  return result
}

export async function getCvTextFromLocal(localCvData) {
  if (!localCvData?.base64) return ''
  const bytes = base64ToUint8Array(localCvData.base64)
  const fileName = (localCvData.fileName || '').toLowerCase()
  if (fileName.endsWith('.pdf')) return extractTextFromPdf(bytes.buffer)
  if (fileName.endsWith('.txt')) {
    try {
      return new TextDecoder().decode(bytes)
    } catch {
      return ''
    }
  }
  if (fileName.match(/\.(doc|docx)$/)) return '' // Word not parsed in browser
  return extractTextFromPdf(bytes.buffer)
}

export async function getCvTextFromUrl(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const buffer = await res.arrayBuffer()
    return extractTextFromPdf(buffer)
  } catch (e) {
    console.error('Fetch CV failed', e)
    return ''
  }
}
