<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <BasePageHeader 
      title="对话" 
      subtitle="向您的文档提问"
    >
      <template #actions>
        <div class="w-64">
          <BaseSelect
            v-model="chatStore.selectedCollection"
            :options="chatStore.collections"
            placeholder="全部集合"
            clearable
            label="知识库："
          />
        </div>
      </template>
    </BasePageHeader>

    <!-- Chat messages -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors" ref="chatContainer">
      <BaseEmptyState 
        v-if="chatStore.messages.length === 0" 
        icon="💬" 
        title="暂无消息" 
        description="在下方输入消息开始对话" 
      />

      <ChatMessage
        v-for="(message, index) in chatStore.messages"
        :key="index"
        :role="message.role"
        :content="message.content"
        :sources="message.sources"
      />

      <div v-if="chatStore.isLoading" class="flex justify-start">
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
          :disabled="chatStore.isLoading"
        />
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="chatStore.isLoading || !newMessage.trim()"
        >
          发送
        </BaseButton>
      </form>
      <div class="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{{ chatStore.messages.length }} 条消息</span>
        <button
          @click="clearChat"
          class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          v-if="chatStore.messages.length > 0"
        >
          清空对话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useChatStore } from '../stores'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseEmptyState from '../components/base/BaseEmptyState.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import ChatMessage from '../components/chat/ChatMessage.vue'

const chatStore = useChatStore()

const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading) return

  const messageToSend = newMessage.value
  newMessage.value = ''
  
  try {
    await chatStore.sendMessage(messageToSend)
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const clearChat = () => {
  if (confirm('确定要清空对话吗？')) {
    chatStore.clearChat()
  }
}

onMounted(() => {
  chatStore.fetchCollections()
})
</script>

