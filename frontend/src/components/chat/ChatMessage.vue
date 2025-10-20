<template>
  <div class="flex" :class="isUser ? 'justify-end' : 'justify-start'">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Source } from '@/types'

interface Props {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

const props = defineProps<Props>()

const isUser = computed(() => props.role === 'user')

const messageClasses = computed(() => {
  return isUser.value
    ? 'bg-primary-600 dark:bg-primary-700 text-white'
    : 'bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-100'
})
</script>

