<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <BasePageHeader 
      title="设置" 
      subtitle="配置您的 RAG 应用"
    />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div class="max-w-3xl">
        <!-- API Configuration -->
        <BaseCard title="API 配置" icon="🔑">
          <div class="space-y-4">
            <BaseInput
              v-model="settings.apiProvider"
              label="API Provider"
              disabled
            />

            <BaseInput
              v-model="settings.deepseekApiBase"
              label="DeepSeek API Base URL"
              placeholder="https://api.deepseek.com/v1"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DeepSeek API 密钥
              </label>
              <div class="relative">
                <input
                  v-model="apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  class="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                />
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {{ showApiKey ? '隐藏' : '显示' }}
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                从 <a href="https://platform.deepseek.com" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">platform.deepseek.com</a> 获取您的 API 密钥
              </p>
            </div>

            <RangeSlider
              v-model="settings.temperature"
              label="Temperature"
              :min="0"
              :max="1"
              :step="0.1"
              min-label="精确"
              max-label="创造性"
            />

            <NumberInput
              v-model="settings.maxTokens"
              label="最大Token数"
              :min="100"
              :max="4000"
              :step="100"
            />
          </div>
        </BaseCard>

        <!-- Embedding Configuration -->
        <BaseCard title="Embedding配置" icon="🧩" class="mt-6">
          <div class="space-y-4">
            <NumberInput
              v-model="settings.embeddingDimensions"
              label="Embedding维度"
              disabled
            />

            <NumberInput
              v-model="settings.chunkSize"
              label="Chunk大小（词数）"
              :min="100"
              :max="1000"
              :step="50"
            />

            <NumberInput
              v-model="settings.chunkOverlap"
              label="Overlapping大小（词数）"
              :min="0"
              :max="200"
              :step="10"
            />

            <NumberInput
              v-model="settings.retrievalCount"
              label="检索数量"
              hint="每次查询检索的文档片段数量"
              :min="1"
              :max="10"
            />
          </div>
        </BaseCard>

        <!-- Server Configuration -->
        <BaseCard title="服务器配置" icon="⚙️" class="mt-6">
          <div class="space-y-4">
            <NumberInput
              v-model="portValue"
              label="服务器端口"
              :min="1000"
              :max="65535"
              hint="重启服务器后生效"
            />
          </div>
        </BaseCard>

        <!-- Database Configuration -->
        <BaseCard title="数据库配置" icon="🗄️" class="mt-6">
          <div class="space-y-4">
            <BaseInput
              v-model="settings.chromaPath"
              label="ChromaDB 存储路径"
              placeholder="./chroma_db"
              hint="ChromaDB 数据库文件的存储位置"
            />

            <BaseAlert
              type="warning"
              message="重置数据库将永久删除所有已上传的文档和嵌入数据。"
            />

            <BaseButton
              variant="danger"
              size="lg"
              full-width
              :loading="isResetting"
              @click="resetDatabase"
            >
              {{ isResetting ? '重置中...' : '重置数据库' }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Save button -->
        <div class="flex justify-end space-x-3 mt-6">
          <BaseButton
            variant="secondary"
            @click="loadSettings"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="isSaving"
            @click="saveSettings"
          >
            {{ isSaving ? '保存中...' : '保存设置' }}
          </BaseButton>
        </div>

        <!-- Save result -->
        <BaseAlert
          v-if="saveResult"
          :type="saveResult.success ? 'success' : 'error'"
          :message="saveResult.message"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import type { Settings } from '../types'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import RangeSlider from '../components/settings/RangeSlider.vue'
import NumberInput from '../components/settings/NumberInput.vue'

const settings = ref<Settings>({
  apiProvider: 'DeepSeek',
  embeddingDimensions: 384,
  chunkSize: 500,
  chunkOverlap: 50,
  retrievalCount: 5,
  temperature: 0.7,
  maxTokens: 2000,
  deepseekApiBase: 'https://api.deepseek.com/v1',
  chromaPath: './chroma_db',
  port: 3000
})

// Computed properties to ensure values are always defined
const portValue = computed({
  get: () => settings.value.port || 3000,
  set: (value: number) => {
    settings.value.port = value
  }
})

const isSaving = ref(false)
const isResetting = ref(false)
const saveResult = ref<{ success: boolean; message: string } | null>(null)
const apiKey = ref('')
const showApiKey = ref(false)

const loadSettings = async () => {
  try {
    const response = await axios.get('/api/settings')
    settings.value = response.data.data
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const saveSettings = async () => {
  isSaving.value = true
  saveResult.value = null

  try {
    const payload = {
      ...settings.value,
      apiKey: apiKey.value || undefined
    }
    
    await axios.put('/api/settings', payload)
    saveResult.value = {
      success: true,
      message: '设置保存成功！'
    }
    
    // Clear API key input after successful save for security
    if (apiKey.value) {
      apiKey.value = ''
      showApiKey.value = false
    }
  } catch (error: any) {
    saveResult.value = {
      success: false,
      message: error.response?.data?.message || '保存设置失败'
    }
  } finally {
    isSaving.value = false

    setTimeout(() => {
      saveResult.value = null
    }, 3000)
  }
}

const resetDatabase = async () => {
  if (!confirm('确定要重置数据库吗？此操作无法撤销。')) {
    return
  }

  if (!confirm('这将删除所有文档。您确定要继续吗？')) {
    return
  }

  isResetting.value = true

  try {
    await axios.post('/api/settings/reset')
    alert('数据库重置成功！')
  } catch (error) {
    console.error('Error resetting database:', error)
    alert('数据库重置失败')
  } finally {
    isResetting.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

