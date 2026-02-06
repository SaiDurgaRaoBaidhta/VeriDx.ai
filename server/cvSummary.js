/**
 * Extract text from a PDF buffer and return a short summary for storage.
 * Uses pdf-parse v2 (PDFParse class).
 */
const MAX_SUMMARY_LENGTH = 2000

function extractSections(text) {
  const sections = []
  const sectionTitles = [
    'experience', 'work experience', 'employment', 'education', 'qualifications',
    'skills', 'summary', 'objective', 'certifications'
  ]
  const lower = (text || '').toLowerCase()
  for (const title of sectionTitles) {
    const idx = lower.indexOf(title)
    if (idx === -1) continue
    const start = idx
    let end = text.length
    for (const other of sectionTitles) {
      if (other === title) continue
      const next = lower.indexOf(other, start + title.length)
      if (next !== -1 && next < end) end = next
    }
    const chunk = text.slice(start, end).replace(/\s+/g, ' ').trim()
    if (chunk.length > 20) sections.push(chunk.slice(0, 400))
  }
  return sections.join('\n\n')
}

export async function summarizePdfBuffer(buffer) {
  if (!buffer || buffer.length === 0) return ''
  let parser
  try {
    const { PDFParse } = await import('pdf-parse')
    const data = buffer instanceof Buffer ? buffer : Buffer.from(buffer)
    parser = new PDFParse({ data })
    const textResult = await parser.getText()
    const text = (textResult && textResult.text) ? textResult.text : ''
    await parser.destroy()
    if (!text.trim()) return '(No text could be extracted from the CV.)'
    const withSections = extractSections(text)
    const summary = withSections || text
    if (summary.length <= MAX_SUMMARY_LENGTH) return summary
    return summary.slice(0, MAX_SUMMARY_LENGTH) + '…'
  } catch (err) {
    if (parser && typeof parser.destroy === 'function') await parser.destroy().catch(() => {})
    console.error('CV summarization error:', err.message)
    return '(Summary could not be generated.)'
  }
}
