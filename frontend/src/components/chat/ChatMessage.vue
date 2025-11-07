<template>
  <div class="flex group items-start gap-2" :class="isUser ? 'justify-end' : 'justify-start'">
    <!-- Action Buttons (left side for user messages) -->
    <div v-if="isUser" class="flex gap-1 flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-all">
      <!-- Edit Button -->
      <button
        @click="handleEdit"
        :disabled="isAnyStreaming"
        class="p-1.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="copyButtonClasses"
        title="编辑消息"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      
      <!-- Replay Button -->
      <button
        @click="handleReplay"
        :disabled="isAnyStreaming"
        class="p-1.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="copyButtonClasses"
        title="重新发送"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      
      <!-- Copy Button -->
      <button
        @click="copyToClipboard"
        class="p-1.5 rounded-md transition-all"
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

    <!-- Message Content -->
    <div
      class="max-w-2xl rounded-lg px-4 py-3 transition-colors"
      :class="messageClasses"
    >
      <!-- Loading indicator when streaming with no content yet -->
      <div v-if="isStreaming && !content" class="flex items-center space-x-2">
        <div class="animate-pulse">思考中...</div>
      </div>
      
      <!-- User message: plain text -->
      <div v-if="content && isUser" class="whitespace-pre-wrap">{{ content }}</div>
      
      <!-- Assistant message: rendered markdown -->
      <div v-if="content && !isUser" class="markdown-content prose prose-sm dark:prose-invert max-w-none" v-html="renderedContent"></div>
      
      <!-- Sources (Collapsible) -->
      <div v-if="sources && sources.length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button
          @click="toggleSources"
          class="flex items-center justify-between w-full text-xs font-semibold mb-2 opacity-75 hover:opacity-100 transition-opacity"
        >
          <span>来源 ({{ sources.length }})</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 transition-transform"
            :class="{ 'rotate-180': showSources }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="showSources" class="space-y-2">
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
import { computed, ref, withDefaults } from 'vue'
import { marked, type Tokens } from 'marked'
import hljs from 'highlight.js'
import type { Source } from '@/types'
import { useToast } from '@/composables/useToast'

// Configure marked
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true // Enable GitHub Flavored Markdown
})

// Custom renderer to add syntax highlighting
const renderer = new marked.Renderer()
const originalCodeRenderer = renderer.code.bind(renderer)
renderer.code = function(code: Tokens.Code) {
  const { text, lang } = code
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
    } catch (err) {
      console.error('Highlight error:', err)
    }
  }
  return originalCodeRenderer(code)
}

interface Props {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  isStreaming?: boolean
  messageIndex?: number
  isAnyStreaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAnyStreaming: false
})

const emit = defineEmits<{
  edit: [index: number, content: string]
  replay: [index: number, content: string]
}>()

const isUser = computed(() => props.role === 'user')
const copied = ref(false)
const showSources = ref(false) // Collapsed by default
const { success, error } = useToast()

// Parse markdown content
const renderedContent = computed(() => {
  if (!props.content) return ''
  // For user messages, keep plain text. For assistant messages, render markdown
  if (isUser.value) {
    return props.content
  }
  return marked.parse(props.content, { renderer }) as string
})

const toggleSources = () => {
  showSources.value = !showSources.value
}

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

const handleEdit = () => {
  if (props.messageIndex !== undefined) {
    emit('edit', props.messageIndex, props.content)
  }
}

const handleReplay = () => {
  if (props.messageIndex !== undefined) {
    emit('replay', props.messageIndex, props.content)
  }
}

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

<style scoped>
/* Markdown content styling */
.markdown-content {
  line-height: 1.6;
}

/* Headings */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h1) { font-size: 1.5em; }
.markdown-content :deep(h2) { font-size: 1.3em; }
.markdown-content :deep(h3) { font-size: 1.1em; }

/* Paragraphs */
.markdown-content :deep(p) {
  margin-bottom: 0.75em;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Lists */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

/* Code */
.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.dark .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Code blocks */
.markdown-content :deep(pre) {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.75em 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875em;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  border-left: 3px solid currentColor;
  padding-left: 1em;
  margin: 0.75em 0;
  opacity: 0.8;
  font-style: italic;
}

/* Links */
.markdown-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #2563eb;
}

/* Tables */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid currentColor;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .markdown-content :deep(th) {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Horizontal rule */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid currentColor;
  opacity: 0.3;
  margin: 1em 0;
}

/* Strong and emphasis */
.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}
</style>

