import express from 'express'
import { upload } from './middleware/upload.js'
import { handleChat } from './handlers/chatHandler.js'
import { 
  getAllFiles, 
  downloadFile,
  deleteFile, 
  getFileStats
} from './handlers/fileHandler.js'
import { handleIngest } from './handlers/ingestHandler.js'
import { 
  getSettings, 
  updateSettings, 
  resetDatabase 
} from './handlers/settingsHandler.js'

const router = express.Router()

// Chat routes
router.post('/chat', handleChat)

// File routes
router.get('/files', getAllFiles)
router.get('/files/stats', getFileStats)
router.get('/files/download/:storedFileName', downloadFile)
router.delete('/files/:fileId', deleteFile)

// Ingest routes
router.post('/ingest', upload.single('file'), handleIngest)

// Settings routes
router.get('/settings', getSettings)
router.put('/settings', updateSettings)
router.post('/settings/reset', resetDatabase)

export default router

