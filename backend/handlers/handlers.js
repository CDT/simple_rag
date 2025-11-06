import chromaService from '../services/chromaService.js'
import deepseekService from '../services/deepseekService.js'
import documentProcessorService from '../services/documentProcessorService.js'
import settingsService from '../services/settingsService.js'
import { routesLogger } from '../config/logger.js'
import { fixUnicodeEncoding } from '../utils.js'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================
// CHAT HANDLERS
// ============================================

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    routesLogger.info(`Processing chat message: ${message}`)

    // Generate embedding for the query
    const queryEmbedding = await deepseekService.getEmbedding(message)

    // Query ChromaDB for relevant documents
    const results = await chromaService.query(queryEmbedding, 5)

    // Format context from retrieved documents
    const context = []
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        context.push({
          document: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances ? results.distances[0][i] : null
        })
      }
    }

    // Build messages array for chat
    const messages = [
      ...history,
      { role: 'user', content: message }
    ]

    // Get response from DeepSeek
    const response = await deepseekService.chat(messages, context)

    res.json({
      success: true,
      data: {
        message: response.message,
        sources: context.map(ctx => ({
          fileName: fixUnicodeEncoding(ctx.metadata.fileName),
          chunkIndex: ctx.metadata.chunkIndex,
          text: ctx.document.substring(0, 200) + '...',
          relevance: ctx.distance ? (1 - ctx.distance).toFixed(3) : null
        })),
        usage: response.usage
      }
    })
  } catch (error) {
    routesLogger.error('Error processing chat:', error)
    res.status(500).json({ 
      error: 'Failed to process chat', 
      message: error.message 
    })
  }
}

// ============================================
// FILES HANDLERS
// ============================================

export const getAllFiles = async (req, res) => {
  try {
    const documents = await chromaService.getAllDocuments()
    
    // Group by fileId to get unique files
    const filesMap = new Map()
    
    if (documents.metadatas) {
      documents.metadatas.forEach((metadata, index) => {
        const fileId = metadata.fileId
        if (!filesMap.has(fileId)) {
          filesMap.set(fileId, {
            fileId: fileId,
            fileName: fixUnicodeEncoding(metadata.fileName),
            storedFileName: metadata.storedFileName || '', // Include stored filename for download links
            chunkCount: metadata.totalChunks,
            uploadDate: metadata.uploadDate
          })
        }
      });
    }

    const files = Array.from(filesMap.values())

    res.json({
      success: true,
      data: {
        files,
        totalFiles: files.length
      }
    })
  } catch (error) {
    routesLogger.error('Error getting files:', error)
    res.status(500).json({ 
      error: 'Failed to get files', 
      message: error.message 
    })
  }
}

export const downloadFile = async (req, res) => {
  try {
    const { storedFileName } = req.params
    
    if (!storedFileName) {
      return res.status(400).json({ error: 'Stored filename is required' })
    }

    const filePath = path.join(__dirname, '../uploads', storedFileName)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Get the original filename from metadata
    const documents = await chromaService.getAllDocuments()
    let originalFileName = storedFileName
    
    if (documents.metadatas) {
      const metadata = documents.metadatas.find(m => m.storedFileName === storedFileName)
      if (metadata && metadata.fileName) {
        originalFileName = metadata.fileName
      }
    }

    // Send the file with proper encoding for the filename
    // Use encodeURIComponent for the filename* parameter (RFC 5987)
    const encodedFileName = encodeURIComponent(originalFileName)
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`)
    res.download(filePath, originalFileName)
  } catch (error) {
    routesLogger.error('Error downloading file:', error)
    res.status(500).json({ 
      error: 'Failed to download file', 
      message: error.message 
    })
  }
}

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params
    
    // Get all documents
    const documents = await chromaService.getAllDocuments()
    
    // Find all chunk IDs for this file and get stored filename
    const chunkIds = []
    let storedFileName = null
    if (documents.metadatas) {
      documents.metadatas.forEach((metadata, index) => {
        if (metadata.fileId === fileId) {
          chunkIds.push(documents.ids[index])
          if (!storedFileName && metadata.storedFileName) {
            storedFileName = metadata.storedFileName
          }
        }
      });
    }

    // Delete all chunks
    for (const chunkId of chunkIds) {
      await chromaService.deleteDocument(chunkId)
    }

    // Delete the physical file if it exists
    if (storedFileName) {
      const filePath = path.join(__dirname, '../uploads', storedFileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        routesLogger.info(`Deleted physical file: ${storedFileName}`)
      }
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        fileId,
        chunksDeleted: chunkIds.length
      }
    })
  } catch (error) {
    routesLogger.error('Error deleting file:', error)
    res.status(500).json({ 
      error: 'Failed to delete file', 
      message: error.message 
    })
  }
}

export const getFileStats = async (req, res) => {
  try {
    const documents = await chromaService.getAllDocuments()
    
    const filesMap = new Map()
    let totalChunks = 0
    
    if (documents.metadatas) {
      totalChunks = documents.metadatas.length
      documents.metadatas.forEach(metadata => {
        const fileId = metadata.fileId
        if (!filesMap.has(fileId)) {
          filesMap.set(fileId, true)
        }
      })
    }

    res.json({
      success: true,
      data: {
        totalFiles: filesMap.size,
        totalChunks: totalChunks
      }
    })
  } catch (error) {
    routesLogger.error('Error getting stats:', error)
    res.status(500).json({ 
      error: 'Failed to get stats', 
      message: error.message 
    })
  }
}

// ============================================
// INGEST HANDLERS
// ============================================

export const handleIngest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Properly decode the filename from buffer to handle UTF-8 characters (Chinese, etc.)
    const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const filePath = req.file.path
    
    routesLogger.info(`Processing file: ${originalname}`)

    // Process document
    const processed = await documentProcessorService.processDocument(filePath, originalname)
    
    // Generate embeddings for chunks
    const embeddings = []
    for (const chunk of processed.chunks) {
      const embedding = await deepseekService.getEmbedding(chunk)
      embeddings.push(embedding)
    }

    // Generate IDs for chunks
    const fileId = uuidv4()
    const ids = processed.chunks.map((_, index) => `${fileId}_chunk_${index}`)
    
    // Create metadata for each chunk
    const metadatas = processed.chunks.map((chunk, index) => ({
      fileName: originalname,
      storedFileName: req.file.filename, // Store the actual saved filename
      fileId: fileId,
      chunkIndex: index,
      totalChunks: processed.chunks.length,
      uploadDate: new Date().toISOString()
    }))

    // Store in ChromaDB
    await chromaService.addDocuments(
      processed.chunks,
      embeddings,
      metadatas,
      ids
    )

    // Clean up uploaded file (optional - keep if you want to retain originals)
    // fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: 'Document ingested successfully',
      data: {
        fileName: originalname,
        fileId: fileId,
        chunkCount: processed.chunks.length,
        textLength: processed.text.length
      }
    })
  } catch (error) {
    routesLogger.error('Error ingesting document:', error)
    res.status(500).json({ 
      error: 'Failed to ingest document', 
      message: error.message 
    })
  }
}

// ============================================
// SETTINGS HANDLERS
// ============================================

export const getSettings = (req, res) => {
  try {
    const settings = settingsService.getFrontendSettings()
    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    routesLogger.error('Error getting settings:', error)
    res.status(500).json({ 
      error: 'Failed to get settings', 
      message: error.message 
    })
  }
}

export const updateSettings = (req, res) => {
  try {
    const settings = req.body
    
    // Update settings using the settings service
    const success = settingsService.updateFromFrontend(settings)
    
    if (success) {
      routesLogger.info('Settings updated successfully')
      
      // Return updated settings (without sensitive data)
      const updatedSettings = settingsService.getFrontendSettings()
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to update settings', 
        message: 'Could not save settings to file' 
      })
    }
  } catch (error) {
    routesLogger.error('Error updating settings:', error)
    res.status(500).json({ 
      error: 'Failed to update settings', 
      message: error.message 
    })
  }
}

export const resetDatabase = async (req, res) => {
  try {
    await chromaService.reset()
    
    res.json({
      success: true,
      message: 'Database reset successfully'
    })
  } catch (error) {
    routesLogger.error('Error resetting database:', error)
    res.status(500).json({ 
      error: 'Failed to reset database', 
      message: error.message 
    })
  }
}

