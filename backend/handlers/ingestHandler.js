import chromaService from '../services/chromaService.js'
import deepseekService from '../services/deepseekService.js'
import documentProcessorService from '../services/documentProcessorService.js'
import { routesLogger } from '../config/logger.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import fs from 'fs'

/**
 * Calculate SHA256 hash of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Hash of the file
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', (error) => reject(error))
  })
}

export const handleIngest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' })
    }

    // Get collection from request body
    const collection = req.body.collection
    if (!collection || collection.trim() === '') {
      return res.status(400).json({ error: '需要指定集合' })
    }

    // Properly decode the filename from buffer to handle UTF-8 characters (Chinese, etc.)
    const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const filePath = req.file.path
    
    routesLogger.info(`Processing file: ${originalname} for collection: ${collection}`)

    // Calculate file hash to prevent duplicates
    const fileHash = await calculateFileHash(filePath)
    routesLogger.info(`File hash: ${fileHash}`)

    // Check for duplicates
    const existingDocuments = await chromaService.getAllDocuments()
    
    // Check if file with same hash already exists (duplicate file)
    if (existingDocuments.metadatas) {
      const duplicateHash = existingDocuments.metadatas.find(
        metadata => metadata.fileHash === fileHash
      )
      
      if (duplicateHash) {
        // Delete the uploaded file since it's a duplicate
        fs.unlinkSync(filePath)
        return res.status(409).json({ 
          error: '重复的文件',
          message: `此文件已作为"${duplicateHash.fileName}"上传到"${duplicateHash.collection}"集合中。`
        })
      }

      // Check if file with same name exists in the same collection
      const duplicateName = existingDocuments.metadatas.find(
        metadata => metadata.fileName === originalname && metadata.collection === collection.trim()
      )
      
      if (duplicateName) {
        // Delete the uploaded file since it's a duplicate name
        fs.unlinkSync(filePath)
        return res.status(409).json({ 
          error: '重复的文件名',
          message: `名为"${originalname}"的文件已存在于"${collection}"集合中。`
        })
      }
    }

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
      fileHash: fileHash, // Store file hash for duplicate detection
      chunkIndex: index,
      totalChunks: processed.chunks.length,
      uploadDate: new Date().toISOString(),
      collection: collection.trim()
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
      message: '文档导入成功',
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
      error: '导入文档失败', 
      message: error.message 
    })
  }
}

