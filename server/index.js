import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'
import { pool, initDb, query } from './db.js'
import { summarizePdfBuffer } from './cvSummary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json')
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const useDb = !!pool

function readSubmissions() {
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeSubmissions(list) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8')
}

function readAdmins() {
  try {
    const raw = fs.readFileSync(ADMINS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeAdmins(list) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2), 'utf8')
}

const fileFilter = (req, file, cb) => {
  const allowed = /\.(pdf|doc|docx)$/i
  if (allowed.test(file.originalname)) cb(null, true)
  else cb(new Error('Only PDF and Word documents are allowed'))
}

const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.bin'
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})

const upload = useDb ? uploadMemory : uploadDisk

const app = express()
app.use(cors())
app.use(express.json())

// POST /api/expert-intake — multipart: name, phone, email, cv
app.post('/api/expert-intake', upload.single('cv'), async (req, res) => {
  try {
    const { name, phone, email } = req.body || {}
    const file = req.file
    if (!name?.trim() || !phone?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name, phone, and email are required' })
    }
    if (!file) return res.status(400).json({ error: 'CV file is required' })

    if (useDb) {
      const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const cvBuffer = file.buffer
      const cvSummary = ''
      await query(
        `INSERT INTO experts (id, name, phone, email, cv_filename, cv_content, cv_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, name.trim(), phone.trim(), email.trim(), file.originalname || null, cvBuffer, cvSummary]
      )
      const summary = await summarizePdfBuffer(cvBuffer)
      await query(`UPDATE experts SET cv_summary = $1 WHERE id = $2`, [summary, id])
      const record = {
        id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        cvFileName: file.originalname,
        submittedAt: new Date().toISOString(),
      }
      return res.status(201).json(record)
    }

    const submissions = readSubmissions()
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const record = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cvFileName: file.originalname,
      cvStoredName: file.filename,
      submittedAt: new Date().toISOString(),
    }
    submissions.push(record)
    writeSubmissions(submissions)
    res.status(201).json(record)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
})

// GET /api/expert-intake — list all submissions
app.get('/api/expert-intake', async (req, res) => {
  try {
    if (useDb) {
      const result = await query(
        `SELECT id, name, phone, email, cv_filename AS "cvFileName", cv_summary AS "cvSummary", submitted_at AS "submittedAt"
         FROM experts ORDER BY submitted_at DESC`
      )
      const list = (result?.rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        cvFileName: r.cvFileName,
        cvSummary: r.cvSummary || null,
        submittedAt: r.submittedAt,
        hasFile: true,
      }))
      return res.json(list)
    }
    const list = readSubmissions().map(({ id, name, phone, email, cvFileName, submittedAt }) => ({
      id,
      name,
      phone,
      email,
      cvFileName,
      submittedAt,
      hasFile: true,
    }))
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/expert-intake/:id — single expert (for dashboard detail with summary)
app.get('/api/expert-intake/:id', async (req, res) => {
  try {
    if (useDb) {
      const result = await query(
        `SELECT id, name, phone, email, cv_filename AS "cvFileName", cv_summary AS "cvSummary", submitted_at AS "submittedAt"
         FROM experts WHERE id = $1`,
        [req.params.id]
      )
      const r = result?.rows?.[0]
      if (!r) return res.status(404).json({ error: 'Not found' })
      return res.json({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        cvFileName: r.cvFileName,
        cvSummary: r.cvSummary,
        submittedAt: r.submittedAt,
        hasFile: true,
      })
    }
    const submissions = readSubmissions()
    const record = submissions.find((s) => s.id === req.params.id)
    if (!record) return res.status(404).json({ error: 'Not found' })
    res.json({
      ...record,
      hasFile: true,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/expert-intake/:id/file — download stored CV
app.get('/api/expert-intake/:id/file', async (req, res) => {
  try {
    if (useDb) {
      const result = await query(
        `SELECT cv_filename, cv_content FROM experts WHERE id = $1`,
        [req.params.id]
      )
      const row = result?.rows?.[0]
      if (!row?.cv_content) return res.status(404).json({ error: 'File not found' })
      const filename = row.cv_filename || 'download'
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(Buffer.from(row.cv_content))
      return
    }
    const submissions = readSubmissions()
    const record = submissions.find((s) => s.id === req.params.id)
    if (!record?.cvStoredName) return res.status(404).json({ error: 'File not found' })
    const filePath = path.join(UPLOADS_DIR, record.cvStoredName)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' })
    res.download(filePath, record.cvFileName || record.cvStoredName)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'VeriDx API', database: useDb ? 'PostgreSQL' : 'file' })
})

// POST /api/admin/signup — create an admin user (Postgres + bcrypt when DATABASE_URL set)
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body || {}
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' })
    }

    if (useDb) {
      const existing = await query(
        `SELECT id FROM admins WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)`,
        [username.trim(), email.trim()]
      )
      if (existing?.rows?.length > 0) {
        return res.status(409).json({ error: 'Username or email already in use' })
      }
      const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const passwordHash = await bcrypt.hash(password, 10)
      await query(
        `INSERT INTO admins (id, username, email, password_hash) VALUES ($1, $2, $3, $4)`,
        [id, username.trim(), email.trim(), passwordHash]
      )
      return res.status(201).json({ id, username: username.trim(), email: email.trim() })
    }

    const admins = readAdmins()
    const taken = admins.find(
      (a) =>
        a.username.toLowerCase() === username.trim().toLowerCase() ||
        a.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (taken) return res.status(409).json({ error: 'Username or email already in use' })
    const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    admins.push({
      id,
      username: username.trim(),
      email: email.trim(),
      password,
      createdAt: new Date().toISOString(),
    })
    writeAdmins(admins)
    res.status(201).json({ id, username: username.trim(), email: email.trim() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
})

// POST /api/admin/login — authenticate by username OR email (Postgres + bcrypt when DATABASE_URL set)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {}
    if (!identifier?.trim() || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' })
    }

    if (useDb) {
      const result = await query(
        `SELECT id, username, email, password_hash FROM admins WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)`,
        [identifier.trim()]
      )
      const admin = result?.rows?.[0]
      if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      return res.json({ id: admin.id, username: admin.username, email: admin.email })
    }

    const admins = readAdmins()
    const idLower = identifier.trim().toLowerCase()
    const admin = admins.find(
      (a) =>
        a.username.toLowerCase() === idLower || a.email.toLowerCase() === idLower
    )
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ id: admin.id, username: admin.username, email: admin.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
})

// DELETE /api/expert-intake/:id
app.delete('/api/expert-intake/:id', async (req, res) => {
  try {
    if (useDb) {
      const result = await query(`DELETE FROM experts WHERE id = $1 RETURNING id`, [req.params.id])
      if (result?.rowCount === 0) return res.status(404).json({ error: 'Submission not found' })
      return res.json({ success: true })
    }
    const submissions = readSubmissions()
    const index = submissions.findIndex((s) => s.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Submission not found' })
    const record = submissions[index]
    if (record.cvStoredName) {
      const filePath = path.join(UPLOADS_DIR, record.cvStoredName)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    submissions.splice(index, 1)
    writeSubmissions(submissions)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

const PORT = process.env.PORT || 3001

initDb().then((ok) => {
  if (ok) console.log('PostgreSQL connected and tables ready')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (database: ${useDb ? 'PostgreSQL' : 'file'})`)
  })
})
