import { defineStore } from 'pinia'
import { ref } from 'vue'
import { httpService } from '../services/httpService'

export const useAppStore = defineStore('app', () => {
  // State
  const isConnected = ref(false)

  // Actions
  const checkConnection = async () => {
    try {
      await httpService.get('/api/health')
      isConnected.value = true
    } catch (error) {
      isConnected.value = false
    }
  }

  return {
    // State
    isConnected,
    // Actions
    checkConnection
  }
})

