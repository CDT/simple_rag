import chromaService from '../services/chromaService.js'
import deepseekService from '../services/deepseekService.js'
import { routesLogger } from '../config/logger.js'
import { fixUnicodeEncoding } from '../utils.js'

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: '需要提供消息' })
    }

    routesLogger.info(`Processing chat message: ${message}`)

    // Generate embedding for the query
    const queryEmbedding = await deepseekService.getEmbedding(message)

    // Query ChromaDB for relevant documents
    const results = await chromaService.query(queryEmbedding, 5)

    // Format context from retrieved documents
    const context = []
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        context.push({
          document: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances ? results.distances[0][i] : null
        })
      }
    }

    // Build messages array for chat
    const messages = [
      ...history,
      { role: 'user', content: message }
    ]

    // Get response from DeepSeek
    const response = await deepseekService.chat(messages, context)

    res.json({
      success: true,
      data: {
        message: response.message,
        sources: context.map(ctx => ({
          fileName: fixUnicodeEncoding(ctx.metadata.fileName),
          chunkIndex: ctx.metadata.chunkIndex,
          text: ctx.document.substring(0, 200) + '...',
          relevance: ctx.distance ? (1 - ctx.distance).toFixed(3) : null
        })),
        usage: response.usage
      }
    })
  } catch (error) {
    routesLogger.error('Error processing chat:', error)
    res.status(500).json({ 
      error: '处理聊天失败', 
      message: error.message 
    })
  }
}

