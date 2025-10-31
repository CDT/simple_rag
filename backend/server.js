import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import { serverLogger } from './config/logger.js'
import settingsService from './services/settingsService.js'

// Import routes
import ingestRouter from './routes/ingest.js'
import chatRouter from './routes/chat.js'
import filesRouter from './routes/files.js'
import settingsRouter from './routes/settings.js'

// Get the directory of the current file (for ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = settingsService.getSetting('server.port') || 3000

// ChromaDB process management
let chromaProcess = null

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create chroma_db directory in the backend folder (where server.js is located)
const chromaDir = path.join(__dirname, 'chroma_db')
if (!fs.existsSync(chromaDir)) {
  fs.mkdirSync(chromaDir, { recursive: true })
  serverLogger.info(`Created chroma_db directory at: ${chromaDir}`)
} else {
  serverLogger.info(`Using chroma_db directory at: ${chromaDir}`)
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
  serverLogger.info(`Created logs directory at: ${logsDir}`)
}

// ChromaDB log file path
const chromaLogPath = path.join(logsDir, 'chroma.log')

// Check if ChromaDB server is already running
async function isChromaRunning() {
  const chromaUrl = settingsService.getSetting('database.chromaUrl') || 'http://localhost:8000'
  try {
    const response = await fetch(`${chromaUrl}/api/v1/heartbeat`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Start ChromaDB server
async function startChromaDB() {
  const isRunning = await isChromaRunning()
  
  if (isRunning) {
    serverLogger.info('ChromaDB server is already running')
    return
  }

  serverLogger.info('Starting ChromaDB server...')
  
  return new Promise((resolve, reject) => {
    let spawnError = null
    
    try {
      // Create a write stream for ChromaDB logs
      const chromaLogStream = fs.createWriteStream(chromaLogPath, { flags: 'a' })
      const logTimestamp = () => `[${new Date().toISOString()}] `
      
      chromaLogStream.write(`\n${logTimestamp()}ChromaDB server starting...\n`)
      serverLogger.info(`ChromaDB logs will be written to: ${chromaLogPath}`)
      
      // Spawn ChromaDB server process
      chromaProcess = spawn('chroma', ['run', '--path', chromaDir, '--host', 'localhost', '--port', '8000'], {
        stdio: 'pipe',
        shell: true
      })

      chromaProcess.stdout.on('data', (data) => {
        const message = data.toString().trim()
        serverLogger.info(`ChromaDB: ${message}`)
        chromaLogStream.write(`${logTimestamp()}[INFO] ${message}\n`)
      })

      chromaProcess.stderr.on('data', (data) => {
        const message = data.toString().trim()
        serverLogger.error(`ChromaDB Error: ${message}`)
        chromaLogStream.write(`${logTimestamp()}[ERROR] ${message}\n`)
      })

      // Capture spawn errors (e.g., command not found)
      chromaProcess.on('error', (error) => {
        spawnError = error
        serverLogger.error('Failed to spawn ChromaDB process:', error)
        chromaLogStream.write(`${logTimestamp()}[ERROR] Failed to spawn: ${error.message}\n`)
        chromaLogStream.end()
        reject(new Error(`Failed to spawn ChromaDB: ${error.message}. Make sure 'chroma' is installed (pip install chromadb).`))
      })

      chromaProcess.on('close', (code) => {
        chromaLogStream.write(`${logTimestamp()}ChromaDB process exited with code ${code}\n`)
        chromaLogStream.end()
        
        if (code !== 0 && code !== null && !spawnError) {
          serverLogger.error(`ChromaDB process exited with code ${code}`)
          reject(new Error(`ChromaDB process exited with code ${code}`))
        }
        chromaProcess = null
      })

      // Wait for ChromaDB to be ready
      const checkReady = async () => {
        let retries = 30
        while (retries > 0) {
          // Stop waiting if spawn error occurred
          if (spawnError) {
            return
          }
          
          await new Promise(res => setTimeout(res, 1000))
          
          if (await isChromaRunning()) {
            serverLogger.info('ChromaDB server started successfully')
            chromaLogStream.write(`${logTimestamp()}[INFO] ChromaDB server started successfully\n`)
            resolve()
            return
          }
          retries--
        }
        
        // Timeout - kill the process and reject
        chromaLogStream.write(`${logTimestamp()}[ERROR] ChromaDB failed to start within timeout (30 seconds)\n`)
        if (chromaProcess) {
          chromaProcess.kill('SIGTERM')
        }
        reject(new Error('ChromaDB server failed to start within timeout (30 seconds). Check the logs above for errors.'))
      }
      
      checkReady()
    } catch (error) {
      serverLogger.error('Error starting ChromaDB:', error)
      reject(error)
    }
  })
}

// Shutdown ChromaDB server
function shutdownChromaDB() {
  if (chromaProcess) {
    serverLogger.info('Shutting down ChromaDB server...')
    chromaProcess.kill('SIGTERM')
    chromaProcess = null
  }
}

// Routes
app.use('/api/ingest', ingestRouter)
app.use('/api/chat', chatRouter)
app.use('/api/files', filesRouter)
app.use('/api/settings', settingsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RAG Backend is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  serverLogger.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  })
})

// Start ChromaDB and then start the Express server
startChromaDB()
  .then(() => {
    app.listen(PORT, () => {
      serverLogger.info(`Server is running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    serverLogger.error('Failed to start server due to ChromaDB error:', error)
    process.exit(1)
  })

// Handle graceful shutdown
function gracefulShutdown(signal) {
  serverLogger.info(`${signal} received, shutting down gracefully...`)
  
  // Shutdown ChromaDB
  shutdownChromaDB()
  
  // Give it some time to cleanup then exit
  setTimeout(() => {
    serverLogger.info('Shutdown complete')
    process.exit(0)
  }, 2000)
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught Exception:', error)
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

