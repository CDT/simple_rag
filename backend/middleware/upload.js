import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Properly decode the filename from buffer to handle UTF-8 characters
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + originalname)
  }
})

export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Properly decode the filename from buffer to handle UTF-8 characters
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const allowedTypes = ['.txt', '.pdf', '.docx']
    const ext = path.extname(originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only .txt, .pdf, and .docx are allowed.'))
    }
  }
})

