# RAG Application Architecture

## System Overview

This is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload documents and chat with them using AI.

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Vue 3)                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Chat     │  │ Knowledge    │  │   Settings   │       │
│  │   View     │  │   Base       │  │     View     │       │
│  └────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    Vue Router + Axios                       │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP API
┌───────────────────────────┼─────────────────────────────────┐
│                    Backend (Express)                        │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐              │
│         │        API Routes                 │              │
│    ┌────┴────┐  ┌────────┐  ┌──────┐  ┌────────┐         │
│    │ /ingest │  │ /chat  │  │/files│  │/settings│         │
│    └────┬────┘  └───┬────┘  └──┬───┘  └───┬────┘         │
│         │           │           │          │               │
│    ┌────┴───────────┴───────────┴──────────┴────┐         │
│    │          Services Layer                     │         │
│    │  ┌──────────────┐  ┌─────────────┐        │         │
│    │  │  Document    │  │  DeepSeek   │        │         │
│    │  │  Processor   │  │  Service    │        │         │
│    │  └──────┬───────┘  └──────┬──────┘        │         │
│    │         │                  │                │         │
│    │  ┌──────┴──────────────────┴──────┐        │         │
│    │  │     Chroma Service             │        │         │
│    │  └──────────────┬─────────────────┘        │         │
└───────────────────────┼──────────────────────────────────-─┘
                        │
                   ┌────┴────┐
                   │ ChromaDB │
                   │  (Local) │
                   └──────────┘
```

## Data Flow

### Document Ingestion Flow

1. **User uploads document** (Chat, Knowledge Base, Settings)
2. **Frontend** sends file via `POST /api/ingest`
3. **Multer** middleware saves file to `uploads/`
4. **Document Processor** extracts text:
   - `.txt`: Direct read with fs
   - `.pdf`: Extract with pdf-parse
   - `.docx`: Extract with mammoth
5. **Text Chunking**: Split into overlapping chunks (500 words, 50 overlap)
6. **Generate Embeddings**: DeepSeek service creates vector embeddings
7. **Store in ChromaDB**: Save chunks with metadata and embeddings
8. **Return success** to frontend

### Chat Flow (RAG)

1. **User sends message** in Chat view
2. **Frontend** sends message via `POST /api/chat`
3. **Generate Query Embedding**: Convert user question to vector
4. **ChromaDB Query**: Find top 5 most similar document chunks
5. **Retrieve Context**: Get matching text chunks and metadata
6. **Build Prompt**: Combine context + conversation history + user message
7. **DeepSeek API Call**: Get response from LLM
8. **Format Response**: Include answer + sources with citations
9. **Return to frontend**: Display answer with source references

## Key Components

### Backend Services

#### Document Processor (`documentProcessor.js`)
- **Purpose**: Extract text from various file formats
- **Methods**:
  - `extractText(filePath)`: Route to appropriate extractor
  - `extractTextFromTxt()`: Read plain text files
  - `extractTextFromDocx()`: Use mammoth to extract from Word docs
  - `extractTextFromPdf()`: Use pdf-parse to extract from PDFs
  - `chunkText(text, chunkSize, overlap)`: Split text into overlapping chunks
  - `processDocument()`: Orchestrate extraction and chunking

#### Chroma Service (`chromaService.js`)
- **Purpose**: Interface with local ChromaDB instance
- **Methods**:
  - `initialize()`: Create/get collection with cosine similarity
  - `addDocuments()`: Store chunks with embeddings and metadata
  - `query()`: Vector similarity search
  - `getAllDocuments()`: List all stored documents
  - `deleteDocument()`: Remove document by ID
  - `reset()`: Clear entire database

#### DeepSeek Service (`deepseekService.js`)
- **Purpose**: Generate embeddings and chat completions
- **Methods**:
  - `getEmbedding(text)`: Convert text to vector (384 dimensions)
  - `chat(messages, context)`: Get LLM response with RAG context
  - `createSimpleEmbedding()`: Fallback embedding function

**Note**: Current implementation uses a simple hash-based embedding for demo purposes. In production, replace with actual embedding API (e.g., OpenAI's text-embedding-ada-002).

### Frontend Components

#### App.vue
- Main layout with sidebar navigation
- Connection status monitoring
- Route management

#### Chat.vue
- Message display with user/assistant styling
- Source citations with relevance scores
- Real-time chat interface
- Auto-scrolling to latest message
- Clear chat functionality

#### KnowledgeBase.vue
- Drag-and-drop file upload
- File list with metadata
- Upload progress indicator
- Delete functionality
- File type validation

#### Settings.vue
- Configuration management
- Temperature and token controls
- Chunk size/overlap settings
- Database reset option

## API Endpoints

### POST `/api/ingest`
- **Purpose**: Upload and process document
- **Input**: Multipart form data with file
- **Processing**:
  1. Save file with multer
  2. Extract text
  3. Chunk text
  4. Generate embeddings
  5. Store in ChromaDB
- **Output**: Success status, file ID, chunk count

### POST `/api/chat`
- **Purpose**: Chat with RAG
- **Input**: Message + conversation history
- **Processing**:
  1. Generate query embedding
  2. Retrieve relevant chunks from ChromaDB
  3. Build context from retrieved chunks
  4. Call DeepSeek API with context
  5. Format response with sources
- **Output**: AI message + source citations

### GET `/api/files`
- **Purpose**: List all uploaded files
- **Processing**: Query ChromaDB, group by fileId
- **Output**: Array of file metadata

### DELETE `/api/files/:fileId`
- **Purpose**: Delete file and all its chunks
- **Processing**: Find all chunks for file, delete from ChromaDB
- **Output**: Success status, deleted chunk count

### GET `/api/settings`
- **Purpose**: Get current settings
- **Output**: Configuration object

### PUT `/api/settings`
- **Purpose**: Update settings
- **Input**: Settings object
- **Output**: Updated settings

### POST `/api/settings/reset`
- **Purpose**: Reset database
- **Processing**: Delete and recreate ChromaDB collection
- **Output**: Success status

## Technology Stack

### Frontend
- **Vue 3**: Composition API for reactive components
- **TypeScript**: Type safety and better IDE support
- **TailwindCSS**: Utility-first styling
- **Vue Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Vite**: Fast development and building

### Backend
- **Express**: Web server framework
- **ChromaDB**: Vector database for embeddings
- **DeepSeek API**: LLM for chat completions
- **Multer**: File upload handling
- **Mammoth**: DOCX text extraction
- **pdf-parse**: PDF text extraction
- **UUID**: Unique identifier generation

## Data Models

### Document Metadata (ChromaDB)
```javascript
{
  fileName: string,        // Original filename
  fileId: string,          // UUID for grouping chunks
  chunkIndex: number,      // Position in document
  totalChunks: number,     // Total chunks for this file
  uploadDate: string       // ISO timestamp
}
```

### Message Format
```typescript
{
  role: 'user' | 'assistant',
  content: string,
  sources?: Source[],
  timestamp?: number
}
```

### Source Citation
```typescript
{
  fileName: string,
  chunkIndex: number,
  text: string,
  relevance?: string
}
```

## Security Considerations

1. **File Upload Validation**: Type checking and size limits
2. **API Key Protection**: Environment variables, never committed
3. **Input Sanitization**: Validate all user inputs
4. **CORS**: Configured for localhost development
5. **Error Handling**: Graceful failures with informative messages

## Performance Optimizations

1. **Chunking Strategy**: 500 words with 50-word overlap balances context and retrieval
2. **Vector Search**: ChromaDB uses HNSW for fast similarity search
3. **Lazy Loading**: Frontend components load on demand
4. **Caching**: Browser caching for static assets

## Future Enhancements

1. **Authentication**: User accounts and document privacy
2. **Real Embeddings**: Replace demo embeddings with production API
3. **Multiple Collections**: Separate document spaces per user
4. **Advanced Chunking**: Semantic chunking based on document structure
5. **File Formats**: Add support for more formats (HTML, Markdown, etc.)
6. **Streaming Responses**: Real-time token streaming for chat
7. **Export Chat**: Save conversations as PDF or text
8. **Document OCR**: Extract text from images and scanned PDFs

