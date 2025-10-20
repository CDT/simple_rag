<template>
  <div
    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors cursor-pointer"
    :class="{ 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20': isDragging }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <div class="text-5xl mb-3">{{ icon }}</div>
    <p class="text-gray-600 dark:text-gray-300 mb-2">{{ title }}</p>
    <p class="text-sm text-gray-400 dark:text-gray-500 mb-4">{{ subtitle }}</p>
    
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileSelect"
    />
    
    <BaseButton
      variant="primary"
      :disabled="disabled"
      @click.stop="triggerFileInput"
    >
      {{ buttonText }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  icon?: string
  title?: string
  subtitle?: string
  buttonText?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📄',
  title: '拖放文件到此处，或点击选择',
  subtitle: '支持格式：.txt、.pdf、.docx',
  buttonText: '选择文件',
  accept: '.txt,.pdf,.docx',
  multiple: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'upload', files: File[]): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) {
    emit('upload', files)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    emit('upload', files)
  }
}

const triggerFileInput = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}
</script>

