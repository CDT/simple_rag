import { ChromaClient } from 'chromadb'
import { servicesLogger } from '../config/logger.js'
import settingsService from './settingsService.js'

class ChromaService {
  constructor() {
    this.client = null
    this.collection = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      // Initialize ChromaDB client with local persistence
      const chromaPath = settingsService.getSetting('database.chromaPath') || './chroma_db'
      this.client = new ChromaClient({
        path: chromaPath
      })

      // Get or create collection
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: 'documents',
          metadata: { 
            description: 'RAG document collection',
            'hnsw:space': 'cosine'
          }
        })
        servicesLogger.info('ChromaDB collection initialized successfully')
      } catch (error) {
        servicesLogger.error('Error creating collection:', error)
        throw error
      }

      this.initialized = true
    } catch (error) {
      servicesLogger.error('Error initializing ChromaDB:', error)
      throw error
    }
  }

  async addDocuments(documents, embeddings, metadatas, ids) {
    await this.initialize()
    
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

  async query(queryEmbedding, nResults = null) {
    await this.initialize()
    
    try {
      // Use settings value if nResults not provided
      const retrievalCount = nResults || settingsService.getSetting('processing.retrievalCount') || 5
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: retrievalCount
      })
      
      return results
    } catch (error) {
      servicesLogger.error('Error querying ChromaDB:', error)
      throw error
    }
  }

  async getAllDocuments() {
    await this.initialize()
    
    try {
      const results = await this.collection.get()
      return results
    } catch (error) {
      servicesLogger.error('Error getting all documents:', error)
      throw error
    }
  }

  async deleteDocument(documentId) {
    await this.initialize()
    
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
    await this.initialize()
    
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
export default new ChromaService()

