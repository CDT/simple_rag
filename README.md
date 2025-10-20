# RAG Web Application

A full-stack **Retrieval-Augmented Generation (RAG)** web application built with **Vue 3 + TypeScript + TailwindCSS** frontend and **Node.js + Express** backend.

## 🌟 Features

- **Document Upload**: Support for `.txt`, `.pdf`, and `.docx` files
- **Vector Database**: Local ChromaDB for document embeddings
- **AI Chat**: DeepSeek API for embeddings and chat completion
- **Modern UI**: Beautiful, responsive interface with TailwindCSS
- **Dark Mode**: 🌙 Full dark mode support with persistent preference
- **Source Citations**: Chat responses include relevant document sources
- **Real-time Updates**: Live connection status monitoring

## 📁 Project Structure

```
simple_rag2/
├── backend/
│   ├── routes/
│   │   ├── chat.js          # Chat endpoint with RAG
│   │   ├── ingest.js        # Document upload & processing
│   │   ├── files.js         # File management
│   │   └── settings.js      # App settings
│   ├── services/
│   │   ├── chromaService.js      # ChromaDB integration
│   │   ├── deepseekService.js    # DeepSeek API client
│   │   └── documentProcessor.js  # Text extraction
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env                 # Environment variables
│
└── frontend/
    ├── src/
    │   ├── views/
    │   │   ├── Chat.vue           # Chat interface
    │   │   ├── KnowledgeBase.vue  # Document management
    │   │   └── Settings.vue       # Configuration
    │   ├── router/
    │   │   └── index.ts           # Vue Router config
    │   ├── types/
    │   │   └── index.ts           # TypeScript types
    │   ├── App.vue                # Main layout with sidebar
    │   ├── main.ts
    │   └── style.css
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- DeepSeek API key (get from [https://platform.deepseek.com](https://platform.deepseek.com))

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and add your DeepSeek API key**:
   ```env
   PORT=3000
   DEEPSEEK_API_KEY=your_actual_api_key_here
   DEEPSEEK_API_BASE=https://api.deepseek.com/v1
   CHROMA_PATH=./chroma_db
   ```

5. **Start the backend server**:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

   The server will start on `http://localhost:3000`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## 📖 Usage Example

### 1. Upload Documents

1. Navigate to **Knowledge Base** in the sidebar
2. Click "Select File" or drag-and-drop a document (`.txt`, `.pdf`, or `.docx`)
3. Wait for processing to complete
4. Your document will appear in the list below

### 2. Chat with Your Documents

1. Navigate to **Chat** in the sidebar
2. Type a question related to your uploaded documents
3. The system will:
   - Generate embeddings for your query
   - Retrieve relevant document chunks from ChromaDB
   - Send context to DeepSeek for answer generation
   - Display the answer with source citations

### 3. Example Workflow

**Step 1: Create a test document**

Create a file `company_info.txt`:
```txt
Acme Corporation was founded in 1995 in San Francisco, California.
We specialize in cloud computing solutions and AI services.
Our main products include DataFlow, CloudSync, and AI Insights.
We have over 5,000 employees worldwide.
Our CEO is Jane Smith, and our headquarters is located at 123 Tech Street.
```

**Step 2: Upload the document**

- Go to Knowledge Base → Upload `company_info.txt`
- Wait for "Successfully uploaded" message

**Step 3: Ask questions**

Example questions to try:
- "When was Acme Corporation founded?"
- "What products does Acme offer?"
- "Who is the CEO?"
- "How many employees does the company have?"

The system will respond with answers and show the relevant source text from your document.

## 🔧 API Endpoints

### POST `/api/ingest`
Upload and process a document.

**Request**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "success": true,
  "data": {
    "fileName": "example.pdf",
    "fileId": "uuid-here",
    "chunkCount": 12,
    "textLength": 5420
  }
}
```

### POST `/api/chat`
Send a chat message and get AI response with RAG.

**Request**:
```json
{
  "message": "What is the company's mission?",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "The company's mission is...",
    "sources": [
      {
        "fileName": "company_info.txt",
        "chunkIndex": 0,
        "text": "Relevant excerpt...",
        "relevance": "0.85"
      }
    ],
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 50,
      "total_tokens": 200
    }
  }
}
```

### GET `/api/files`
Get all uploaded files.

**Response**:
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "uuid",
        "fileName": "document.pdf",
        "chunkCount": 15,
        "uploadDate": "2025-10-20T10:30:00.000Z"
      }
    ],
    "totalFiles": 1
  }
}
```

### DELETE `/api/files/:fileId`
Delete a file and its embeddings.

### GET `/api/settings`
Get current configuration.

### PUT `/api/settings`
Update configuration.

### POST `/api/settings/reset`
Reset database (delete all documents).

## 🎨 Frontend Features

### Chat View
- Message history with user/assistant messages
- Source citations with relevance scores
- Auto-scroll to latest message
- Loading states
- Clear chat functionality

### Knowledge Base View
- Drag-and-drop file upload
- File type validation
- Upload progress indicator
- Document list with metadata
- Delete functionality
- Relative time formatting

### Settings View
- Temperature control (0-1)
- Max tokens configuration
- Chunk size/overlap settings
- Retrieval count adjustment
- Database reset option

### Dark Mode
- Toggle button in sidebar (☀️/🌙)
- Persistent preference in localStorage
- System preference detection
- Smooth transitions
- Full coverage across all components

## 🛠️ Technologies Used

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Vue Router**: Client-side routing
- **Axios**: HTTP client
- **Vite**: Fast build tool

### Backend
- **Express**: Web framework
- **ChromaDB**: Vector database
- **DeepSeek API**: LLM and embeddings
- **Multer**: File upload handling
- **Mammoth**: DOCX text extraction
- **pdf-parse**: PDF text extraction
- **UUID**: Unique ID generation

## 📝 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DEEPSEEK_API_KEY` | DeepSeek API key | (required) |
| `DEEPSEEK_API_BASE` | DeepSeek API base URL | https://api.deepseek.com/v1 |
| `CHROMA_PATH` | ChromaDB storage path | ./chroma_db |

### Document Processing Settings

- **Chunk Size**: 500 words (configurable in Settings)
- **Chunk Overlap**: 50 words (configurable in Settings)
- **Embedding Dimensions**: 384
- **Retrieval Count**: 5 (configurable in Settings)

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `.env` file exists with valid API key
- Ensure all dependencies are installed: `npm install`

### Error: "ENOENT: no such file or directory... pdf-parse"
**Fixed!** This was a known issue with `pdf-parse` trying to load test files on import. The solution uses dynamic imports so `pdf-parse` only loads when actually processing a PDF file. If you still see this error, make sure you have the latest code from `backend/services/documentProcessor.js`.

### Error: "Cannot access 'upload' before initialization"
**Fixed!** This was a circular dependency between `server.js` and `routes/ingest.js`. The solution extracts the multer configuration to `backend/middleware/upload.js`, breaking the circular dependency.

### Frontend shows "Disconnected"
- Make sure backend is running on port 3000
- Check browser console for CORS errors
- Verify proxy configuration in `vite.config.ts`

### File upload fails
- Check file type is `.txt`, `.pdf`, or `.docx`
- Verify `uploads/` directory exists and is writable
- Check backend logs for detailed error messages

### Chat returns errors
- Verify DeepSeek API key is valid
- Check API rate limits
- Ensure documents are uploaded first

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your DeepSeek API key secure
- Implement authentication in production
- Validate file uploads thoroughly
- Set appropriate CORS policies for production

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
```

The production-ready files will be in `frontend/dist/`

### Backend
The backend runs as-is in production. Consider:
- Using PM2 or similar for process management
- Setting up nginx as reverse proxy
- Enabling HTTPS
- Implementing rate limiting
- Adding authentication

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this code for your projects.

## 🙏 Acknowledgments

- DeepSeek for AI capabilities
- ChromaDB for vector storage
- Vue.js community
- TailwindCSS for styling

---

**Built with ❤️ using modern web technologies**

