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
              v-model="settingsStore.settings.apiProvider"
              label="API Provider"
              disabled
            />

            <BaseInput
              v-model="settingsStore.settings.apiBase"
              label="DeepSeek API Base URL"
              placeholder="https://api.deepseek.com/v1"
            />

            <BaseInput
              v-model="settingsStore.settings.apiKey"
              label="DeepSeek API 密钥"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              hint="从 platform.deepseek.com 获取您的 API 密钥"
            />

            <RangeSlider
              v-model="settingsStore.settings.temperature"
              label="Temperature"
              :min="0"
              :max="1"
              :step="0.1"
              min-label="精确"
              max-label="创造性"
            />

            <NumberInput
              v-model="settingsStore.settings.maxTokens"
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
              v-model="settingsStore.settings.embeddingDimensions"
              label="Embedding维度"
              disabled
            />

            <NumberInput
              v-model="settingsStore.settings.chunkSize"
              label="Chunk大小（词数）"
              :min="100"
              :max="1000"
              :step="50"
            />

            <NumberInput
              v-model="settingsStore.settings.chunkOverlap"
              label="Overlapping大小（词数）"
              :min="0"
              :max="200"
              :step="10"
            />

            <NumberInput
              v-model="settingsStore.settings.retrievalCount"
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
              v-model="settingsStore.portValue"
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
              v-model="settingsStore.settings.chromaPath"
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
              :loading="settingsStore.isResetting"
              @click="resetDatabase"
            >
              {{ settingsStore.isResetting ? '重置中...' : '重置数据库' }}
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
            :loading="settingsStore.isSaving"
            @click="saveSettings"
          >
            {{ settingsStore.isSaving ? '保存中...' : '保存设置' }}
          </BaseButton>
        </div>

        <!-- Save result -->
        <BaseAlert
          v-if="settingsStore.saveResult"
          :type="settingsStore.saveResult.success ? 'success' : 'error'"
          :message="settingsStore.saveResult.message"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '../stores'
import BasePageHeader from '../components/base/BasePageHeader.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseAlert from '../components/base/BaseAlert.vue'
import RangeSlider from '../components/settings/RangeSlider.vue'
import NumberInput from '../components/settings/NumberInput.vue'

const settingsStore = useSettingsStore()

const loadSettings = async () => {
  try {
    await settingsStore.loadSettings()
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const saveSettings = async () => {
  try {
    await settingsStore.saveSettings()
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const resetDatabase = async () => {
  if (!confirm('确定要重置数据库吗？此操作无法撤销。')) {
    return
  }

  if (!confirm('这将删除所有文档。您确定要继续吗？')) {
    return
  }

  try {
    await settingsStore.resetDatabase()
    alert('数据库重置成功！')
  } catch (error) {
    console.error('Error resetting database:', error)
    alert('数据库重置失败')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

