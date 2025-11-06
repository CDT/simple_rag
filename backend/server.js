import express from 'express'
import cors from 'cors'
import { serverLogger } from './config/logger.js'
import settingsService from './services/settingsService.js'
import chromaService from './services/chromaService.js'

// Import routes
import router from './routes.js'

const app = express()
const PORT = settingsService.getSetting('server.port') || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', router)

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

// Initialize ChromaService and start the Express server
async function startServer() {
  try {
    serverLogger.info('Initializing ChromaService...')
    await chromaService.initialize()
    serverLogger.info('ChromaService initialized successfully')
    
    app.listen(PORT, () => {
      serverLogger.info(`Server is running on http://localhost:${PORT}`)
    })
  } catch (error) {
    serverLogger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Handle graceful shutdown
function gracefulShutdown(signal) {
  serverLogger.info(`${signal} received, shutting down gracefully...`)
  
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

