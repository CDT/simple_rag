import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { servicesLogger } from '../config/logger.js';

class DocumentProcessor {
  async extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      switch (ext) {
        case '.txt':
          return await this.extractTextFromTxt(filePath);
        case '.docx':
          return await this.extractTextFromDocx(filePath);
        case '.pdf':
          return await this.extractTextFromPdf(filePath);
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      servicesLogger.error(`Error extracting text from ${filePath}:`, error);
      throw error;
    }
  }

  async extractTextFromTxt(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  async extractTextFromDocx(filePath) {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  async extractTextFromPdf(filePath) {
    // Dynamic import to avoid pdf-parse loading test files on startup
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  chunkText(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  async processDocument(filePath, fileName) {
    try {
      // Extract text
      const text = await this.extractText(filePath);
      
      // Chunk text
      const chunks = this.chunkText(text);
      
      return {
        fileName,
        filePath,
        text,
        chunks,
        chunkCount: chunks.length
      };
    } catch (error) {
      servicesLogger.error('Error processing document:', error);
      throw error;
    }
  }
}

export default new DocumentProcessor();

