import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpService } from '../services/httpService'
import type { FileInfo } from '../types'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // State
  const files = ref<FileInfo[]>([])
  const collections = ref<string[]>([])
  const isLoadingFiles = ref(false)
  const isUploading = ref(false)
  const isDeletingFile = ref<string | null>(null)
  const uploadResult = ref<{ success: boolean; message: string } | null>(null)

  // Getters
  const filesByCollection = computed(() => {
    const groups: Record<string, FileInfo[]> = {}
    files.value.forEach(file => {
      const collection = file.collection || 'Uncategorized'
      if (!groups[collection]) {
        groups[collection] = []
      }
      groups[collection].push(file)
    })
    return groups
  })

  const getFilesByCollection = (collectionName: string) => {
    if (!collectionName) {
      return files.value
    }
    return files.value.filter(file => file.collection === collectionName)
  }

  // Actions
  const loadFiles = async () => {
    isLoadingFiles.value = true
    try {
      const response = await httpService.get('/api/files')
      files.value = response.data.data.files
      collections.value = response.data.data.collections || []
    } catch (error) {
      console.error('Error loading files:', error)
      throw error
    } finally {
      isLoadingFiles.value = false
    }
  }

  const uploadFile = async (file: File, collection: string) => {
    if (!collection.trim()) {
      uploadResult.value = {
        success: false,
        message: '请输入或选择一个集合'
      }
      return
    }

    isUploading.value = true
    uploadResult.value = null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('collection', collection.trim())

    try {
      const response = await httpService.post('/api/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      uploadResult.value = {
        success: true,
        message: `Successfully uploaded ${file.name} to collection "${collection}" (${response.data.data.chunkCount} chunks)`
      }

      // Reload files
      await loadFiles()

      // Clear result after 5 seconds
      setTimeout(() => {
        uploadResult.value = null
      }, 5000)
    } catch (error: any) {
      uploadResult.value = {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to upload file'
      }
      throw error
    } finally {
      isUploading.value = false
    }
  }

  const deleteFile = async (fileId: string) => {
    isDeletingFile.value = fileId
    try {
      await httpService.delete(`/api/files/${fileId}`)
      await loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    } finally {
      isDeletingFile.value = null
    }
  }

  const clearUploadResult = () => {
    uploadResult.value = null
  }

  return {
    // State
    files,
    collections,
    isLoadingFiles,
    isUploading,
    isDeletingFile,
    uploadResult,
    // Getters
    filesByCollection,
    getFilesByCollection,
    // Actions
    loadFiles,
    uploadFile,
    deleteFile,
    clearUploadResult
  }
})

