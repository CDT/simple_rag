import chromaService from '../services/chromaService.js'
import { routesLogger } from '../config/logger.js'
import { fixUnicodeEncoding } from '../utils.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getAllFiles = async (req, res) => {
  try {
    const documents = await chromaService.getAllDocuments()
    
    // Group by fileId to get unique files
    const filesMap = new Map()
    const collectionsSet = new Set()
    
    if (documents.metadatas) {
      documents.metadatas.forEach((metadata, index) => {
        const fileId = metadata.fileId
        const collection = metadata.collection || 'Uncategorized'
        collectionsSet.add(collection)
        
        if (!filesMap.has(fileId)) {
          filesMap.set(fileId, {
            fileId: fileId,
            fileName: fixUnicodeEncoding(metadata.fileName),
            storedFileName: metadata.storedFileName || '', // Include stored filename for download links
            chunkCount: metadata.totalChunks,
            uploadDate: metadata.uploadDate,
            collection: collection
          })
        }
      });
    }

    const files = Array.from(filesMap.values())
    const collections = Array.from(collectionsSet).sort()

    res.json({
      success: true,
      data: {
        files,
        totalFiles: files.length,
        collections
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

