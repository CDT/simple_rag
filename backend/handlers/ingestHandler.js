import chromaService from '../services/chromaService.js'
import deepseekService from '../services/deepseekService.js'
import documentProcessorService from '../services/documentProcessorService.js'
import { routesLogger } from '../config/logger.js'
import { v4 as uuidv4 } from 'uuid'

export const handleIngest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Get collection from request body
    const collection = req.body.collection
    if (!collection || collection.trim() === '') {
      return res.status(400).json({ error: 'Collection is required' })
    }

    // Properly decode the filename from buffer to handle UTF-8 characters (Chinese, etc.)
    const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const filePath = req.file.path
    
    routesLogger.info(`Processing file: ${originalname} for collection: ${collection}`)

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

