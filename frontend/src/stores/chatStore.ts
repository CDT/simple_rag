import { defineStore } from 'pinia'
import { ref } from 'vue'
import { httpService } from '../services/httpService'
import { API_URL } from '../../config'
import type { Message } from '../types'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const collections = ref<string[]>([])
  const selectedCollection = ref<string | number>('')

  // Actions
  const fetchCollections = async () => {
    try {
      const response = await httpService.get('/api/files')
      if (response.data.success && response.data.data.collections) {
        collections.value = response.data.data.collections
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      throw error
    }
  }

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading.value) return

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: Date.now()
    }

    messages.value.push(userMessage)
    isLoading.value = true

    // Create placeholder for assistant message
    messages.value.push({
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    })

    // Keep track of the index for reactivity updates
    const assistantIndex = messages.value.length - 1

    try {
      // Build history (all messages except the user message and placeholder)
      const history = messages.value.slice(0, -2).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          history,
          collection: selectedCollection.value || undefined
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let buffer = ''
      let accumulatedContent = ''
      let sources: any[] | undefined
      let hasStartedStreaming = false

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue
          
          try {
            const data = JSON.parse(trimmedLine.substring(6))
            
            if (data.type === 'sources') {
              sources = data.sources
              // Trigger reactivity by replacing the array element
              messages.value[assistantIndex] = {
                ...messages.value[assistantIndex],
                sources: sources
              }
            } else if (data.type === 'content') {
              // Hide loading indicator once we start receiving content
              if (!hasStartedStreaming) {
                isLoading.value = false
                hasStartedStreaming = true
              }
              
              // Append content chunk
              accumulatedContent += data.content
              // Trigger reactivity by replacing the array element
              messages.value[assistantIndex] = {
                ...messages.value[assistantIndex],
                content: accumulatedContent,
                isStreaming: true
              }
            } else if (data.type === 'usage') {
              // Store usage info if needed
              console.log('Usage:', data.usage)
            } else if (data.type === 'done') {
              // Stream complete - mark as no longer streaming
              messages.value[assistantIndex] = {
                ...messages.value[assistantIndex],
                isStreaming: false
              }
              break
            } else if (data.type === 'error') {
              throw new Error(data.error)
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      // Update the placeholder message with error
      messages.value[assistantIndex] = {
        ...messages.value[assistantIndex],
        content: `Error: ${error.message || 'Failed to get response'}`,
        isStreaming: false
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
  }

  const setSelectedCollection = (collection: string | number) => {
    selectedCollection.value = collection
  }

  return {
    // State
    messages,
    isLoading,
    collections,
    selectedCollection,
    // Actions
    fetchCollections,
    sendMessage,
    clearChat,
    setSelectedCollection
  }
})

