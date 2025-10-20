# Project Structure

Complete file tree of the RAG Web Application:

```
simple_rag2/
│
├── README.md                          # Main documentation
├── SETUP_GUIDE.md                     # Quick setup instructions
├── ARCHITECTURE.md                    # Technical architecture details
├── PROJECT_STRUCTURE.md               # This file
├── .gitignore                         # Git ignore rules
│
├── example_documents/                 # Sample documents for testing
│   ├── company_info.txt              # Company information example
│   └── product_manual.txt            # Product manual example
│
├── backend/                           # Node.js + Express backend
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables (create from .env.example)
│   ├── .env.example                  # Example environment file
│   ├── .gitignore                    # Backend-specific ignores
│   ├── server.js                     # Main Express server
│   │
│   ├── middleware/                   # Express middleware
│   │   └── upload.js                # Multer file upload configuration
│   │
│   ├── routes/                       # API route handlers
│   │   ├── ingest.js                # POST /api/ingest - Document upload
│   │   ├── chat.js                  # POST /api/chat - Chat with RAG
│   │   ├── files.js                 # GET/DELETE /api/files - File management
│   │   └── settings.js              # GET/PUT /api/settings - Configuration
│   │
│   ├── services/                     # Business logic services
│   │   ├── chromaService.js         # ChromaDB vector database interface
│   │   ├── deepseekService.js       # DeepSeek API client (embeddings + LLM)
│   │   └── documentProcessor.js     # Text extraction (txt, pdf, docx)
│   │
│   ├── uploads/                      # Uploaded files (auto-created)
│   └── chroma_db/                    # ChromaDB data (auto-created)
│
└── frontend/                          # Vue 3 + TypeScript frontend
    ├── package.json                  # Frontend dependencies
    ├── .gitignore                    # Frontend-specific ignores
    ├── index.html                    # HTML entry point
    ├── vite.config.ts                # Vite configuration
    ├── tsconfig.json                 # TypeScript config
    ├── tsconfig.node.json            # TypeScript config for Node
    ├── tailwind.config.js            # TailwindCSS configuration
    ├── postcss.config.js             # PostCSS configuration
    │
    └── src/                          # Source files
        ├── main.ts                   # Vue app entry point
        ├── style.css                 # Global styles + Tailwind imports
        ├── App.vue                   # Root component with sidebar layout
        │
        ├── router/                   # Vue Router
        │   └── index.ts              # Route definitions
        │
        ├── types/                    # TypeScript type definitions
        │   └── index.ts              # Shared interfaces (Message, Source, etc.)
        │
        └── views/                    # Main view components
            ├── Chat.vue              # Chat interface with RAG
            ├── KnowledgeBase.vue     # Document upload and management
            └── Settings.vue          # Application settings
```

## Key Files Explained

### Backend

| File | Purpose | Key Features |
|------|---------|--------------|
| `server.js` | Express server setup | CORS, multer config, route mounting |
| `routes/ingest.js` | Document ingestion endpoint | File upload, text extraction, embedding generation |
| `routes/chat.js` | Chat endpoint | Query embedding, vector search, LLM response |
| `routes/files.js` | File management | List files, delete files |
| `routes/settings.js` | Configuration | Get/update settings, reset database |
| `services/chromaService.js` | Vector database | CRUD operations on embeddings |
| `services/deepseekService.js` | AI services | Embeddings and chat completions |
| `services/documentProcessor.js` | Text extraction | Support for .txt, .pdf, .docx |

### Frontend

| File | Purpose | Key Features |
|------|---------|--------------|
| `App.vue` | Main layout | Sidebar navigation, connection status |
| `views/Chat.vue` | Chat interface | Message history, source citations |
| `views/KnowledgeBase.vue` | Document management | Drag-drop upload, file list |
| `views/Settings.vue` | Configuration UI | Sliders, inputs, database reset |
| `router/index.ts` | Routing | Three main routes (/, /knowledge-base, /settings) |
| `types/index.ts` | Type definitions | TypeScript interfaces |
| `style.css` | Global styles | Tailwind imports, custom scrollbar |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Upload and process document |
| POST | `/api/chat` | Send message and get AI response |
| GET | `/api/files` | List all uploaded files |
| DELETE | `/api/files/:fileId` | Delete a specific file |
| GET | `/api/settings` | Get current configuration |
| PUT | `/api/settings` | Update configuration |
| POST | `/api/settings/reset` | Reset database (delete all documents) |
| GET | `/api/health` | Health check endpoint |

## Data Flow

### Document Upload
```
User → KnowledgeBase.vue → POST /api/ingest → 
documentProcessor (extract text) → 
deepseekService (generate embeddings) → 
chromaService (store vectors) → 
Response → KnowledgeBase.vue (success)
```

### Chat with RAG
```
User → Chat.vue → POST /api/chat → 
deepseekService (query embedding) → 
chromaService (vector search) → 
deepseekService (LLM with context) → 
Response with sources → Chat.vue (display)
```

## Configuration Files

### `backend/.env`
```env
PORT=3000                                    # Server port
DEEPSEEK_API_KEY=your_key                   # DeepSeek API key (required)
DEEPSEEK_API_BASE=https://api.deepseek.com/v1  # API base URL
CHROMA_PATH=./chroma_db                     # ChromaDB storage path
```

### `frontend/vite.config.ts`
- Proxy configuration for `/api` → `http://localhost:3000`
- Path aliases (`@` → `./src`)

### `tailwind.config.js`
- Custom color palette (primary blue shades)
- Content paths for purging

## Auto-Generated Directories

These directories are created automatically when you run the application:

- `backend/uploads/` - Stores uploaded files
- `backend/chroma_db/` - ChromaDB vector database storage
- `frontend/dist/` - Production build output (after `npm run build`)
- `frontend/node_modules/` - Frontend dependencies
- `backend/node_modules/` - Backend dependencies

## Development Workflow

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Make Changes**: Edit files in `backend/` or `frontend/src/`
4. **Test**: Upload documents in Knowledge Base, chat in Chat view
5. **Build**: `cd frontend && npm run build` for production

## Dependencies Overview

### Backend (package.json)
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling
- `chromadb` - Vector database
- `axios` - HTTP client (for DeepSeek API)
- `mammoth` - DOCX text extraction
- `pdf-parse` - PDF text extraction
- `dotenv` - Environment variables
- `uuid` - Unique ID generation

### Frontend (package.json)
- `vue` - UI framework
- `vue-router` - Routing
- `axios` - HTTP client
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - CSS framework

