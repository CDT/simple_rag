<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Sidebar -->
    <AppSidebar
      :menu-items="menuItems"
      :is-dark="isDark"
      :is-connected="appStore.isConnected"
      @toggle-dark-mode="toggleDarkMode"
    />

    <!-- Main content -->
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>

    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores'
import { useDarkMode } from './composables/useDarkMode'
import { AppSidebar } from './components'
import Toast from './components/Toast.vue'

const menuItems = [
  { name: '对话', path: '/', icon: '💬' },
  { name: '知识库', path: '/knowledge-base', icon: '📚' },
  { name: '设置', path: '/settings', icon: '⚙️' }
]

const appStore = useAppStore()
const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
  appStore.checkConnection()
  setInterval(() => appStore.checkConnection(), 30000) // Check every 30 seconds
})
</script>

