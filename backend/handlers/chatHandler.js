import chromaService from '../services/chromaService.js'
import deepseekService from '../services/deepseekService.js'
import { routesLogger } from '../config/logger.js'
import { fixUnicodeEncoding } from '../utils.js'

export const handleChatStream = async (req, res) => {
  try {
    const { message, history = [], collection } = req.body

    if (!message) {
      return res.status(400).json({ error: '需要提供消息' })
    }

    routesLogger.info(`Processing streaming chat message: ${message}${collection ? ` for collection: ${collection}` : ''}`)

    // Generate embedding for the query
    const queryEmbedding = await deepseekService.getEmbedding(message)

    // Query ChromaDB for relevant documents (with optional collection filter)
    const results = await chromaService.query(queryEmbedding, 5, collection)

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

    // Send sources first
    const sources = context.map(ctx => ({
      fileName: fixUnicodeEncoding(ctx.metadata.fileName),
      chunkIndex: ctx.metadata.chunkIndex,
      text: ctx.document.substring(0, 200) + '...',
      relevance: ctx.distance ? (1 - ctx.distance).toFixed(3) : null
    }))

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Send sources as first event
    res.write(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`)

    // Build messages array for chat
    const messages = [
      ...history,
      { role: 'user', content: message }
    ]

    // Stream response from DeepSeek
    try {
      for await (const chunk of deepseekService.chatStream(messages, context)) {
        if (chunk.type === 'content') {
          res.write(`data: ${JSON.stringify({ type: 'content', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'usage') {
          res.write(`data: ${JSON.stringify({ type: 'usage', usage: chunk.usage })}\n\n`)
        }
      }

      // Send done event
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
    } catch (streamError) {
      routesLogger.error('Error during streaming:', streamError)
      res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`)
      res.end()
    }
  } catch (error) {
    routesLogger.error('Error processing streaming chat:', error)
    if (!res.headersSent) {
      res.status(500).json({ 
        error: '处理聊天失败', 
        message: error.message 
      })
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
      res.end()
    }
  }
}

export const handleChat = async (req, res) => {
  try {
    const { message, history = [], collection } = req.body

    if (!message) {
      return res.status(400).json({ error: '需要提供消息' })
    }

    routesLogger.info(`Processing chat message: ${message}${collection ? ` for collection: ${collection}` : ''}`)

    // Generate embedding for the query
    const queryEmbedding = await deepseekService.getEmbedding(message)

    // Query ChromaDB for relevant documents (with optional collection filter)
    const results = await chromaService.query(queryEmbedding, 5, collection)

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

