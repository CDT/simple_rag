import axios from 'axios';

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      console.warn('WARNING: DEEPSEEK_API_KEY not set in environment variables');
    }
  }

  async getEmbedding(text) {
    try {
      // DeepSeek doesn't have a dedicated embedding model, so we'll simulate it
      // In production, you might want to use OpenAI's embedding API or another service
      // For now, we'll create a simple hash-based embedding
      const embedding = this.createSimpleEmbedding(text);
      return embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  // Simple embedding function (for demo purposes)
  // In production, replace this with actual API call to embedding service
  createSimpleEmbedding(text, dimensions = 384) {
    const embedding = new Array(dimensions).fill(0);
    
    // Simple hash-based embedding
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = charCode % dimensions;
      embedding[index] += Math.sin(charCode * 0.1);
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }

  async chat(messages, context = null) {
    try {
      // Prepare system message with context
      let systemMessage = 'You are a helpful assistant.';
      if (context && context.length > 0) {
        const contextText = context.map(doc => doc.document).join('\n\n');
        systemMessage = `You are a helpful assistant. Use the following context to answer questions. If the answer cannot be found in the context, say so.\n\nContext:\n${contextText}`;
      }

      const fullMessages = [
        { role: 'system', content: systemMessage },
        ...messages
      ];

      const response = await axios.post(
        `${this.apiBase}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        message: response.data.choices[0].message.content,
        usage: response.data.usage,
        sources: context || []
      };
    } catch (error) {
      console.error('Error calling DeepSeek API:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DeepSeekService();

