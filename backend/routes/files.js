import express from 'express';
import chromaService from '../services/chromaService.js';
import { routesLogger } from '../config/logger.js';

const router = express.Router();

// Get all files
router.get('/', async (req, res) => {
  try {
    const documents = await chromaService.getAllDocuments();
    
    // Group by fileId to get unique files
    const filesMap = new Map();
    
    if (documents.metadatas) {
      documents.metadatas.forEach((metadata, index) => {
        const fileId = metadata.fileId;
        if (!filesMap.has(fileId)) {
          filesMap.set(fileId, {
            fileId: fileId,
            fileName: metadata.fileName,
            chunkCount: metadata.totalChunks,
            uploadDate: metadata.uploadDate
          });
        }
      });
    }

    const files = Array.from(filesMap.values());

    res.json({
      success: true,
      data: {
        files,
        totalFiles: files.length
      }
    });
  } catch (error) {
    routesLogger.error('Error getting files:', error);
    res.status(500).json({ 
      error: 'Failed to get files', 
      message: error.message 
    });
  }
});

// Delete a file
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get all documents
    const documents = await chromaService.getAllDocuments();
    
    // Find all chunk IDs for this file
    const chunkIds = [];
    if (documents.metadatas) {
      documents.metadatas.forEach((metadata, index) => {
        if (metadata.fileId === fileId) {
          chunkIds.push(documents.ids[index]);
        }
      });
    }

    // Delete all chunks
    for (const chunkId of chunkIds) {
      await chromaService.deleteDocument(chunkId);
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        fileId,
        chunksDeleted: chunkIds.length
      }
    });
  } catch (error) {
    routesLogger.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Failed to delete file', 
      message: error.message 
    });
  }
});

// Get file stats
router.get('/stats', async (req, res) => {
  try {
    const documents = await chromaService.getAllDocuments();
    
    const filesMap = new Map();
    let totalChunks = 0;
    
    if (documents.metadatas) {
      totalChunks = documents.metadatas.length;
      documents.metadatas.forEach(metadata => {
        const fileId = metadata.fileId;
        if (!filesMap.has(fileId)) {
          filesMap.set(fileId, true);
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalFiles: filesMap.size,
        totalChunks: totalChunks
      }
    });
  } catch (error) {
    routesLogger.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Failed to get stats', 
      message: error.message 
    });
  }
});

export default router;

