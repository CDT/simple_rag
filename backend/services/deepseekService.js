import httpService from './httpService.js'
import { servicesLogger } from '../config/logger.js'
import settingsService from './settingsService.js'

class DeepSeekService {
  constructor() {
    this.updateConfig()
  }

  updateConfig() {
    this.apiKey = settingsService.getSetting('api.apiKey')
    this.apiBase = settingsService.getSetting('api.apiBase') || 'https://api.deepseek.com/v1'
  }

  async getEmbedding(text) {
    try {
      // DeepSeek doesn't have a dedicated embedding model, so we'll simulate it
      // In production, you might want to use OpenAI's embedding API or another service
      // For now, we'll create a simple hash-based embedding
      const embedding = this.createSimpleEmbedding(text)
      return embedding
    } catch (error) {
      servicesLogger.error('Error getting embedding:', error)
      throw error
    }
  }

  // Simple embedding function (for demo purposes)
  // In production, replace this with actual API call to embedding service
  createSimpleEmbedding(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0)
    
    // Simple hash-based embedding
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      const index = charCode % dimensions
      embedding[index] += Math.sin(charCode * 0.1)
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / (magnitude || 1))
  }

  async chat(messages, context = null) {
    try {
      // Update config in case settings changed
      this.updateConfig()
      
      // Prepare system message with context
      let systemMessage = 'You are a helpful assistant.'
      if (context && context.length > 0) {
        const contextText = context.map(doc => doc.document).join('\n\n')
        systemMessage = `You are a helpful assistant. Use the following context to answer questions. If the answer cannot be found in the context, say so.\n\nContext:\n${contextText}`
      }

      const fullMessages = [
        { role: 'system', content: systemMessage },
        ...messages
      ]

      const temperature = settingsService.getSetting('model.temperature') || 0.7
      const maxTokens = settingsService.getSetting('model.maxTokens') || 2000

      const response = await httpService.post(
        `${this.apiBase}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: fullMessages,
          temperature: temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        message: response.data.choices[0].message.content,
        usage: response.data.usage,
        sources: context || []
      }
    } catch (error) {
      servicesLogger.error('Error calling DeepSeek API:', error.response?.data || error.message)
      throw error
    }
  }
}

export default new DeepSeekService()

