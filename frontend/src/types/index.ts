export interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp?: number
}

export interface Source {
  fileName: string
  chunkIndex: number
  text: string
  relevance?: string
}

export interface FileItem {
  fileName: string
  chunkCount: number
  uploadDate: string
}

export interface FileInfo {
  fileId: string
  fileName: string
  storedFileName: string
  fileHash: string
  chunkCount: number
  uploadDate: string
  collection: string
}

export interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  message: string
  progress?: number
}

export interface Settings {
  apiProvider: string
  temperature: number
  maxTokens: number
  embeddingDimensions: number
  chunkSize: number
  chunkOverlap: number
  retrievalCount: number
  apiKey: string
  apiBase: string
  chromaPath: string
  port: number
}
