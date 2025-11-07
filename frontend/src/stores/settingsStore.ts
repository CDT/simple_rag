import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpService } from '../services/httpService'
import type { Settings } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<Settings>({
    apiProvider: 'DeepSeek',
    apiKey: '',
    embeddingDimensions: 384,
    chunkSize: 500,
    chunkOverlap: 50,
    retrievalCount: 5,
    temperature: 0.7,
    maxTokens: 2000,
    apiBase: 'https://api.deepseek.com/v1',
    chromaPath: './chroma_db',
    port: 3000
  })

  const isSaving = ref(false)
  const isResetting = ref(false)
  const saveResult = ref<{ success: boolean; message: string } | null>(null)

  // Getters
  const portValue = computed({
    get: () => settings.value.port || 3000,
    set: (value: number) => {
      settings.value.port = value
    }
  })

  // Actions
  const loadSettings = async () => {
    try {
      const response = await httpService.get('/api/settings')
      settings.value = response.data.data
    } catch (error) {
      console.error('Error loading settings:', error)
      throw error
    }
  }

  const saveSettings = async () => {
    isSaving.value = true
    saveResult.value = null

    try {
      await httpService.put('/api/settings', settings.value)
      saveResult.value = {
        success: true,
        message: '设置保存成功！'
      }

      // Clear result after 3 seconds
      setTimeout(() => {
        saveResult.value = null
      }, 3000)
    } catch (error: any) {
      saveResult.value = {
        success: false,
        message: error.response?.data?.message || '保存设置失败'
      }
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const resetDatabase = async () => {
    isResetting.value = true

    try {
      await httpService.post('/api/settings/reset')
    } catch (error) {
      console.error('Error resetting database:', error)
      throw error
    } finally {
      isResetting.value = false
    }
  }

  const clearSaveResult = () => {
    saveResult.value = null
  }

  return {
    // State
    settings,
    isSaving,
    isResetting,
    saveResult,
    // Getters
    portValue,
    // Actions
    loadSettings,
    saveSettings,
    resetDatabase,
    clearSaveResult
  }
})

