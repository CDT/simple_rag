import { defineStore } from 'pinia'
import { ref } from 'vue'
import { httpService } from '../services/httpService'
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

    try {
      // Build history (all messages except the one we just added)
      const history = messages.value.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await httpService.post('/api/chat', {
        message: messageContent,
        history,
        collection: selectedCollection.value || undefined
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.data.message,
        sources: response.data.data.sources,
        timestamp: Date.now()
      }

      messages.value.push(assistantMessage)
    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.response?.data?.message || error.message || 'Failed to get response'}`,
        timestamp: Date.now()
      }
      messages.value.push(errorMessage)
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

