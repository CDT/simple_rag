<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <BasePageHeader title="知识库" subtitle="管理您的文档">
      <template #actions>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold">{{ files.length }}</span> 个文件
        </div>
      </template>
    </BasePageHeader>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Upload section -->
      <BaseCard title="上传文档" icon="📄">
        <FileUploadZone 
          :disabled="isUploading"
          @upload="handleUpload"
        />

        <!-- Upload progress -->
        <BaseProgressBar
          v-if="isUploading"
          :label="`正在上传 ${selectedFile?.name}...`"
          indeterminate
          class="mt-4"
        />

        <!-- Upload result -->
        <BaseAlert
          v-if="uploadResult"
          :type="uploadResult.success ? 'success' : 'error'"
          :title="uploadResult.success ? '成功' : '错误'"
          :message="uploadResult.message"
          class="mt-4"
        />
      </BaseCard>

      <!-- Files list -->
      <BaseCard title="已上传文档" icon="📚" class="mt-6">
        <div v-if="isLoadingFiles" class="text-center py-8 text-gray-500 dark:text-gray-400">
          加载中...
        </div>

        <BaseEmptyState
          v-else-if="files.length === 0"
          icon="📚"
          title="暂无文档"
          description="请在上方上传您的第一个文档"
        />

        <div v-else class="space-y-3">
          <FileCard
            v-for="file in files"
            :key="file.fileId"
            :file-name="file.fileName"
            :stored-file-name="file.storedFileName"
            :chunk-count="file.chunkCount"
            :upload-date="file.uploadDate"
            :is-deleting="isDeletingFile === file.fileId"
            @delete="deleteFile(file.fileId)"
          />
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { httpService } from '../services/httpService'
import type { FileInfo } from '../types'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseEmptyState from '../components/base/BaseEmptyState.vue'
import BaseProgressBar from '../components/base/BaseProgressBar.vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import FileUploadZone from '../components/knowledge/FileUploadZone.vue'
import FileCard from '../components/knowledge/FileCard.vue'

const files = ref<FileInfo[]>([])
const isLoadingFiles = ref(false)
const isUploading = ref(false)
const selectedFile = ref<File | null>(null)
const uploadResult = ref<{ success: boolean; message: string } | null>(null)
const isDeletingFile = ref<string | null>(null)
const collectionName = ref('')

const loadFiles = async () => {
  isLoadingFiles.value = true
  try {
    const response = await httpService.get('/api/files')
    files.value = response.data.data.files
  } catch (error) {
    console.error('Error loading files:', error)
  } finally {
    isLoadingFiles.value = false
  }
}

const handleUpload = (uploadedFiles: File[]) => {
  if (uploadedFiles.length > 0) {
    uploadFile(uploadedFiles[0])
  }
}

const uploadFile = async (file: File) => {
  selectedFile.value = file
  isUploading.value = true
  uploadResult.value = null

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await httpService.post('/api/ingest', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    uploadResult.value = {
      success: true,
      message: `Successfully uploaded ${file.name} (${response.data.data.chunkCount} chunks)`
    }

    // Reload files
    await loadFiles()
  } catch (error: any) {
    uploadResult.value = {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to upload file'
    }
  } finally {
    isUploading.value = false
    selectedFile.value = null

    // Clear result after 5 seconds
    setTimeout(() => {
      uploadResult.value = null
    }, 5000)
  }
}

const deleteFile = async (fileId: string) => {
  if (!confirm('确定要删除此文件吗？')) {
    return
  }

  isDeletingFile.value = fileId
  try {
    await httpService.delete(`/api/files/${fileId}`)
    await loadFiles()
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('删除文件失败')
  } finally {
    isDeletingFile.value = null
  }
}

onMounted(() => {
  loadFiles()
})
</script>

