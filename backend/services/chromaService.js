import { ChromaClient } from 'chromadb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromaService {
  constructor() {
    this.client = null;
    this.collection = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize ChromaDB client with local persistence
      const chromaPath = process.env.CHROMA_PATH || './chroma_db';
      this.client = new ChromaClient({
        path: chromaPath
      });

      // Get or create collection
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: 'documents',
          metadata: { 
            description: 'RAG document collection',
            'hnsw:space': 'cosine'
          }
        });
        console.log('ChromaDB collection initialized successfully');
      } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing ChromaDB:', error);
      throw error;
    }
  }

  async addDocuments(documents, embeddings, metadatas, ids) {
    await this.initialize();
    
    try {
      await this.collection.add({
        ids: ids,
        embeddings: embeddings,
        documents: documents,
        metadatas: metadatas
      });
      console.log(`Added ${documents.length} documents to ChromaDB`);
      return true;
    } catch (error) {
      console.error('Error adding documents to ChromaDB:', error);
      throw error;
    }
  }

  async query(queryEmbedding, nResults = 5) {
    await this.initialize();
    
    try {
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults
      });
      
      return results;
    } catch (error) {
      console.error('Error querying ChromaDB:', error);
      throw error;
    }
  }

  async getAllDocuments() {
    await this.initialize();
    
    try {
      const results = await this.collection.get();
      return results;
    } catch (error) {
      console.error('Error getting all documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    await this.initialize();
    
    try {
      await this.collection.delete({
        ids: [documentId]
      });
      console.log(`Deleted document ${documentId} from ChromaDB`);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async reset() {
    await this.initialize();
    
    try {
      await this.client.deleteCollection({ name: 'documents' });
      this.collection = await this.client.createCollection({
        name: 'documents',
        metadata: { 
          description: 'RAG document collection',
          'hnsw:space': 'cosine'
        }
      });
      console.log('ChromaDB collection reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting ChromaDB:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new ChromaService();

