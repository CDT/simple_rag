<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Sidebar -->
    <AppSidebar
      :menu-items="menuItems"
      :is-dark="isDark"
      :is-connected="isConnected"
      @toggle-dark-mode="toggleDarkMode"
    />

    <!-- Main content -->
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useDarkMode } from './composables/useDarkMode'
import AppSidebar from './components/layout/AppSidebar.vue'

const menuItems = [
  { name: '对话', path: '/', icon: '💬' },
  { name: '知识库', path: '/knowledge-base', icon: '📚' },
  { name: '设置', path: '/settings', icon: '⚙️' }
]

const isConnected = ref(false)
const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

const checkConnection = async () => {
  try {
    await axios.get('/api/health')
    isConnected.value = true
  } catch (error) {
    isConnected.value = false
  }
}

onMounted(() => {
  initDarkMode()
  checkConnection()
  setInterval(checkConnection, 30000) // Check every 30 seconds
})
</script>

