<template>
  <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <div class="flex items-center space-x-4">
      <div class="text-3xl">{{ icon }}</div>
      <div>
        <p class="font-medium text-gray-800 dark:text-gray-100">{{ fileName }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ chunkCount }} 个片段 • 上传于 {{ formattedDate }}
        </p>
      </div>
    </div>
    
    <BaseButton
      variant="danger"
      size="md"
      :loading="isDeleting"
      @click="$emit('delete')"
    >
      {{ isDeleting ? '删除中...' : '删除' }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  fileName: string
  chunkCount: number
  uploadDate: string
  isDeleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false
})

defineEmits(['delete'])

const icon = computed(() => {
  const ext = props.fileName.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📕',
    docx: '📘',
    txt: '📄'
  }
  return icons[ext || ''] || '📄'
})

const formattedDate = computed(() => {
  const date = new Date(props.uploadDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN')
})
</script>

