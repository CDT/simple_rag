import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { ChromaClient } from 'chromadb'
import { servicesLogger } from '../config/logger.js'
import settingsService from './settingsService.js'

// Get the directory of the current file (for ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create chroma_db directory in the backend folder
const chromaDir = path.join(__dirname, '..', 'chroma_db')
if (!fs.existsSync(chromaDir)) {
  fs.mkdirSync(chromaDir, { recursive: true })
  servicesLogger.info(`Created chroma_db directory at: ${chromaDir}`)
} else {
  servicesLogger.info(`Using chroma_db directory at: ${chromaDir}`)
}

// ChromaDB Service Class
class ChromaService {
  constructor() {
    this.client = null
    this.collection = null
    this.initialized = false
  }

  async initialize() {
    try {
      // Initialize ChromaDB client - connects to ChromaDB server
      const chromaUrl = settingsService.getSetting('database.chromaUrl') || 'http://localhost:8000'
      
      // Parse URL to extract host and port
      const url = new URL(chromaUrl)
      const host = url.hostname
      const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80)
      
      this.client = new ChromaClient({
        host: host,
        port: port
      })

      // Get or create collection
      // Note: We provide pre-computed embeddings, so we don't need ChromaDB's embedding function
      // For ChromaDB 1.x, embeddingFunction is optional when providing embeddings directly
      this.collection = await this.client.getOrCreateCollection({
        name: 'documents',
        metadata: { 
          description: 'RAG document collection',
          'hnsw:space': 'cosine'
        }
      })
      
      servicesLogger.info('ChromaDB collection initialized successfully')
      this.initialized = true
    } catch (error) {
      servicesLogger.error('Error initializing ChromaDB:', error)
      throw error
    }
  }

  async addDocuments(documents, embeddings, metadatas, ids) {
    try {
      await this.collection.add({
        ids: ids,
        embeddings: embeddings,
        documents: documents,
        metadatas: metadatas
      })
      servicesLogger.info(`Added ${documents.length} documents to ChromaDB`)
      return true
    } catch (error) {
      servicesLogger.error('Error adding documents to ChromaDB:', error)
      throw error
    }
  }

  async query(queryEmbedding, nResults = null, collection = null) {
    try {
      // Use settings value if nResults not provided
      const retrievalCount = nResults || settingsService.getSetting('processing.retrievalCount') || 5
      
      const queryParams = {
        queryEmbeddings: [queryEmbedding],
        nResults: retrievalCount
      }

      // Add collection filter if provided
      if (collection) {
        queryParams.where = { collection: collection }
      }
      
      const results = await this.collection.query(queryParams)
      
      return results
    } catch (error) {
      servicesLogger.error('Error querying ChromaDB:', error)
      throw error
    }
  }

  async getAllDocuments() {
    try {
      const results = await this.collection.get()
      return results
    } catch (error) {
      servicesLogger.error('Error getting all documents:', error)
      throw error
    }
  }

  async deleteDocument(documentId) {
    try {
      await this.collection.delete({
        ids: [documentId]
      })
      servicesLogger.info(`Deleted document ${documentId} from ChromaDB`)
      return true
    } catch (error) {
      servicesLogger.error('Error deleting document:', error)
      throw error
    }
  }

  async reset() {
    try {
      await this.client.deleteCollection({ name: 'documents' })
      this.collection = await this.client.createCollection({
        name: 'documents',
        metadata: { 
          description: 'RAG document collection',
          'hnsw:space': 'cosine'
        }
      })
      servicesLogger.info('ChromaDB collection reset successfully')
      return true
    } catch (error) {
      servicesLogger.error('Error resetting ChromaDB:', error)
      throw error
    }
  }
}

// Export singleton instance
const chromaServiceInstance = new ChromaService()
export default chromaServiceInstance

