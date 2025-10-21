<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <TransitionGroup
        name="toast"
        tag="div"
        class="space-y-3"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="toastClasses(toast.type)"
          class="w-96 max-w-md shadow-xl rounded-lg pointer-events-auto ring-1 ring-black/10 dark:ring-white/10 overflow-hidden backdrop-blur-sm"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="text-xl" :class="iconClasses(toast.type)">{{ toastIcon(toast.type) }}</span>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-semibold" :class="titleClasses(toast.type)">{{ toast.title }}</p>
                <p v-if="toast.message" class="mt-1 text-sm" :class="messageClasses(toast.type)">
                  {{ toast.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="remove(toast.id)"
                  class="inline-flex text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 transition ease-in-out duration-150"
                >
                  <span class="sr-only">关闭</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type Toast } from '../composables/useToast'

const { toasts, remove } = useToast()

const toastClasses = (type: Toast['type']) => {
  const base = 'bg-white/95 dark:bg-gray-800/95'
  
  const variants = {
    success: 'border-l-4 border-green-500 dark:border-green-400',
    error: 'border-l-4 border-red-500 dark:border-red-400',
    warning: 'border-l-4 border-yellow-500 dark:border-yellow-400',
    info: 'border-l-4 border-blue-500 dark:border-blue-400'
  }
  
  return [base, variants[type]].join(' ')
}

const iconClasses = (type: Toast['type']) => {
  const variants = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }
  
  return variants[type]
}

const titleClasses = (type: Toast['type']) => {
  const variants = {
    success: 'text-gray-900 dark:text-green-100',
    error: 'text-gray-900 dark:text-red-100',
    warning: 'text-gray-900 dark:text-yellow-100',
    info: 'text-gray-900 dark:text-blue-100'
  }
  
  return variants[type]
}

const messageClasses = (type: Toast['type']) => {
  const variants = {
    success: 'text-gray-700 dark:text-green-200',
    error: 'text-gray-700 dark:text-red-200',
    warning: 'text-gray-700 dark:text-yellow-200',
    info: 'text-gray-700 dark:text-blue-200'
  }
  
  return variants[type]
}

const toastIcon = (type: Toast['type']) => {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }
  
  return icons[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
