<template>
  <aside class="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-colors">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ appTitle }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ appSubtitle }}</p>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-4 py-3 mb-2 rounded-lg transition-colors"
        :class="[
          $route.path === item.path 
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <span class="text-xl mr-3">{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <!-- Dark mode toggle -->
      <button
        @click="$emit('toggleDarkMode')"
        class="w-full flex items-center justify-between px-4 py-2 mb-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span class="flex items-center">
          <span class="text-lg mr-2">{{ isDark ? '🌙' : '☀️' }}</span>
          {{ isDark ? '深色模式' : '浅色模式' }}
        </span>
        <span class="text-xs text-gray-400">{{ isDark ? '开启' : '关闭' }}</span>
      </button>

      <!-- Status Info -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <div class="flex justify-between mb-1">
          <span>状态：</span>
          <span :class="isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ isConnected ? '● 已连接' : '● 未连接' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span>版本：</span>
          <span>{{ version }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface MenuItem {
  name: string
  path: string
  icon: string
}

interface Props {
  appTitle?: string
  appSubtitle?: string
  menuItems: MenuItem[]
  isDark: boolean
  isConnected: boolean
  version?: string
}

withDefaults(defineProps<Props>(), {
  appTitle: 'RAG 应用',
  appSubtitle: '知识库问答',
  version: '1.0.0'
})

defineEmits(['toggleDarkMode'])
</script>

