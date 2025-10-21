<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <BasePageHeader 
      title="对话" 
      subtitle="向您的文档提问"
    />

    <!-- Chat messages -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors" ref="chatContainer">
      <BaseEmptyState 
        v-if="messages.length === 0" 
        icon="💬" 
        title="暂无消息" 
        description="在下方输入消息开始对话" 
      />

      <ChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :role="message.role"
        :content="message.content"
        :sources="message.sources"
      />

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg px-4 py-3 text-gray-800 dark:text-gray-100 transition-colors">
          <div class="flex items-center space-x-2">
            <div class="animate-pulse">思考中...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <form @submit.prevent="sendMessage" class="flex space-x-3">
        <input
          v-model="newMessage"
          type="text"
          placeholder="输入您的问题..."
          class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          :disabled="isLoading"
        />
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="isLoading || !newMessage.trim()"
        >
          发送
        </BaseButton>
      </form>
      <div class="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{{ messages.length }} 条消息</span>
        <button
          @click="clearChat"
          class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          v-if="messages.length > 0"
        >
          清空对话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { httpService } from '../services/httpService'
import type { Message } from '../types'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseEmptyState from '../components/base/BaseEmptyState.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ChatMessage from '../components/chat/ChatMessage.vue'

const messages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return

  const userMessage: Message = {
    role: 'user',
    content: newMessage.value,
    timestamp: Date.now()
  }

  messages.value.push(userMessage)
  scrollToBottom()

  const messageToSend = newMessage.value
  newMessage.value = ''
  isLoading.value = true

  try {
    // Build history
    const history = messages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }))

    const response = await httpService.post('/api/chat', {
      message: messageToSend,
      history
    })

    const assistantMessage: Message = {
      role: 'assistant',
      content: response.data.data.message,
      sources: response.data.data.sources,
      timestamp: Date.now()
    }

    messages.value.push(assistantMessage)
    scrollToBottom()
  } catch (error: any) {
    console.error('Error sending message:', error)
    const errorMessage: Message = {
      role: 'assistant',
      content: `Error: ${error.response?.data?.message || error.message || 'Failed to get response'}`,
      timestamp: Date.now()
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const clearChat = () => {
  if (confirm('确定要清空对话吗？')) {
    messages.value = []
  }
}
</script>

