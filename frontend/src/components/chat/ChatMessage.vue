<template>
  <div class="flex group items-start gap-2" :class="isUser ? 'justify-end' : 'justify-start'">
    <!-- Copy Button (left side for user messages) -->
    <button
      v-if="isUser"
      @click="copyToClipboard"
      class="flex-shrink-0 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 mt-2"
      :class="copyButtonClasses"
      :title="copied ? '已复制！' : '复制消息'"
    >
      <!-- Copy Icon -->
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <!-- Check Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <!-- Message Content -->
    <div
      class="max-w-2xl rounded-lg px-4 py-3 transition-colors"
      :class="messageClasses"
    >
      <div class="whitespace-pre-wrap">{{ content }}</div>
      
      <!-- Sources -->
      <div v-if="sources && sources.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p class="text-xs font-semibold mb-2 opacity-75">来源：</p>
        <div class="space-y-2">
          <div
            v-for="(source, idx) in sources"
            :key="idx"
            class="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded transition-colors"
          >
            <div class="font-semibold text-gray-800 dark:text-gray-200">
              {{ source.fileName }} (片段 {{ source.chunkIndex }})
            </div>
            <div class="mt-1 opacity-75">{{ source.text }}</div>
            <div v-if="source.relevance" class="mt-1 text-primary-600 dark:text-primary-400">
              相关度：{{ (parseFloat(source.relevance) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Button (right side for assistant messages) -->
    <button
      v-if="!isUser"
      @click="copyToClipboard"
      class="flex-shrink-0 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 mt-2"
      :class="copyButtonClasses"
      :title="copied ? '已复制！' : '复制消息'"
    >
      <!-- Copy Icon -->
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <!-- Check Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Source } from '@/types'
import { useToast } from '@/composables/useToast'

interface Props {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

const props = defineProps<Props>()

const isUser = computed(() => props.role === 'user')
const copied = ref(false)
const { success, error } = useToast()

const messageClasses = computed(() => {
  return isUser.value
    ? 'bg-primary-600 dark:bg-primary-700 text-white'
    : 'bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-100'
})

const copyButtonClasses = computed(() => {
  return isUser.value
    ? 'bg-primary-700 dark:bg-primary-800 hover:bg-primary-800 dark:hover:bg-primary-900 text-white'
    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    success('复制成功', '消息已复制到剪贴板')
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    error('复制失败', '无法复制到剪贴板')
  }
}
</script>

