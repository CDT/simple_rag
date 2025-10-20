import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import routes
import ingestRouter from './routes/ingest.js';
import chatRouter from './routes/chat.js';
import filesRouter from './routes/files.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create chroma_db directory if it doesn't exist
const chromaDir = process.env.CHROMA_PATH || './chroma_db';
if (!fs.existsSync(chromaDir)) {
  fs.mkdirSync(chromaDir, { recursive: true });
}

// Routes
app.use('/api/ingest', ingestRouter);
app.use('/api/chat', chatRouter);
app.use('/api/files', filesRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RAG Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

