import express from 'express';
import { upload } from '../middleware/upload.js';
import documentProcessor from '../services/documentProcessor.js';
import chromaService from '../services/chromaService.js';
import deepseekService from '../services/deepseekService.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, path: filePath } = req.file;
    
    console.log(`Processing file: ${originalname}`);

    // Process document
    const processed = await documentProcessor.processDocument(filePath, originalname);
    
    // Generate embeddings for chunks
    const embeddings = [];
    for (const chunk of processed.chunks) {
      const embedding = await deepseekService.getEmbedding(chunk);
      embeddings.push(embedding);
    }

    // Generate IDs for chunks
    const fileId = uuidv4();
    const ids = processed.chunks.map((_, index) => `${fileId}_chunk_${index}`);
    
    // Create metadata for each chunk
    const metadatas = processed.chunks.map((chunk, index) => ({
      fileName: originalname,
      fileId: fileId,
      chunkIndex: index,
      totalChunks: processed.chunks.length,
      uploadDate: new Date().toISOString()
    }));

    // Store in ChromaDB
    await chromaService.addDocuments(
      processed.chunks,
      embeddings,
      metadatas,
      ids
    );

    // Clean up uploaded file (optional - keep if you want to retain originals)
    // fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Document ingested successfully',
      data: {
        fileName: originalname,
        fileId: fileId,
        chunkCount: processed.chunks.length,
        textLength: processed.text.length
      }
    });
  } catch (error) {
    console.error('Error ingesting document:', error);
    res.status(500).json({ 
      error: 'Failed to ingest document', 
      message: error.message 
    });
  }
});

export default router;

