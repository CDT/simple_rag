<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <BasePageHeader title="知识库" subtitle="管理您的文档">
      <template #actions>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold">{{ knowledgeStore.files.length }}</span> 个文件
        </div>
      </template>
    </BasePageHeader>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Upload section -->
      <BaseCard title="上传文档" icon="📄">
        <!-- Collection input -->
        <div class="mb-4">
          <BaseSelect
            v-model="newCollection"
            :options="collectionInputOptions"
            label="集合"
            placeholder="输入新集合名称或选择现有集合"
            :disabled="isUploading"
            required
            class="mb-4 max-w-md"
            creatable
            clearable
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            输入新的集合名称或从下拉列表中选择现有集合
          </p>
        </div>

        <FileUploadZone 
          :disabled="knowledgeStore.isUploading || !newCollection.trim()"
          @upload="handleUpload"
        />

        <!-- Upload progress -->
        <BaseProgressBar
          v-if="knowledgeStore.isUploading"
          :label="`正在上传 ${selectedFile?.name}...`"
          indeterminate
          class="mt-4"
        />

        <!-- Upload result -->
        <BaseAlert
          v-if="knowledgeStore.uploadResult"
          :type="knowledgeStore.uploadResult.success ? 'success' : 'error'"
          :title="knowledgeStore.uploadResult.success ? '成功' : '错误'"
          :message="knowledgeStore.uploadResult.message"
          class="mt-4"
        />
      </BaseCard>

      <!-- Files list -->
      <BaseCard title="已上传文档" icon="📚" class="mt-6">
        <!-- Collection filter -->
        <div v-if="knowledgeStore.collections.length > 0" class="mb-4 flex items-center gap-2">
          <BaseSelect
            v-model="selectedCollection"
            :options="collectionOptions"
            label="筛选集合"
            placeholder="全部集合"
            class="min-w-[200px]"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ filteredFiles.length }} 个文件)
          </span>
        </div>

        <div v-if="knowledgeStore.isLoadingFiles" class="text-center py-8 text-gray-500 dark:text-gray-400">
          加载中...
        </div>

        <BaseEmptyState
          v-else-if="knowledgeStore.files.length === 0"
          icon="📚"
          title="暂无文档"
          description="请在上方上传您的第一个文档"
        />

        <BaseEmptyState
          v-else-if="filteredFiles.length === 0"
          icon="🔍"
          title="无匹配文档"
          description="该集合中暂无文档"
        />

        <div v-else>
          <!-- Group by collection -->
          <div v-for="(group, collection) in groupedFiles" :key="collection" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
              <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md mr-2">
                {{ collection }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                ({{ group.length }} 个文件)
              </span>
            </h3>
            <div class="space-y-3">
              <FileCard
                v-for="file in group"
                :key="file.fileId"
                :file-name="file.fileName"
                :stored-file-name="file.storedFileName"
                :chunk-count="file.chunkCount"
                :upload-date="file.uploadDate"
                :collection="file.collection"
                :is-deleting="knowledgeStore.isDeletingFile === file.fileId"
                @delete="deleteFile(file.fileId)"
              />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useKnowledgeStore } from '../stores'
import type { FileInfo } from '../types'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseEmptyState from '../components/base/BaseEmptyState.vue'
import BaseProgressBar from '../components/base/BaseProgressBar.vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import FileUploadZone from '../components/knowledge/FileUploadZone.vue'
import FileCard from '../components/knowledge/FileCard.vue'

const knowledgeStore = useKnowledgeStore()

const selectedFile = ref<File | null>(null)
const newCollection = ref('')
const selectedCollection = ref('')

// Computed property for collection input options
const collectionInputOptions = computed(() => {
  return knowledgeStore.collections.map(collection => ({
    label: collection,
    value: collection
  }))
})

// Computed property for collection filter options
const collectionOptions = computed(() => {
  return [
    { label: '全部集合', value: '' },
    ...knowledgeStore.collections.map(collection => ({
      label: collection,
      value: collection
    }))
  ]
})

// Computed property to filter files by selected collection
const filteredFiles = computed(() => {
  return knowledgeStore.getFilesByCollection(selectedCollection.value)
})

// Computed property to group files by collection
const groupedFiles = computed(() => {
  const groups: Record<string, FileInfo[]> = {}
  filteredFiles.value.forEach(file => {
    const collection = file.collection || 'Uncategorized'
    if (!groups[collection]) {
      groups[collection] = []
    }
    groups[collection].push(file)
  })
  return groups
})

const handleUpload = (uploadedFiles: File[]) => {
  if (uploadedFiles.length > 0) {
    uploadFile(uploadedFiles[0])
  }
}

const uploadFile = async (file: File) => {
  selectedFile.value = file
  try {
    await knowledgeStore.uploadFile(file, newCollection.value)
  } catch (error) {
    console.error('Error uploading file:', error)
  } finally {
    selectedFile.value = null
  }
}

const deleteFile = async (fileId: string) => {
  if (!confirm('确定要删除此文件吗？')) {
    return
  }

  try {
    await knowledgeStore.deleteFile(fileId)
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('删除文件失败')
  }
}

onMounted(() => {
  knowledgeStore.loadFiles()
})
</script>

