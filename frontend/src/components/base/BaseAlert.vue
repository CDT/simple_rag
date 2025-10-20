<template>
  <div v-if="show" :class="alertClasses" role="alert">
    <p class="font-semibold">{{ title || defaultTitle }}</p>
    <p v-if="message" class="text-sm mt-1">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message?: string
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  show: true
})

const alertClasses = computed(() => {
  const base = 'p-4 rounded-lg transition-colors'
  
  const variants = {
    success: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
  }
  
  return [base, variants[props.type]].join(' ')
})

const defaultTitle = computed(() => {
  const titles = {
    success: '✓ 成功',
    error: '✗ 错误',
    warning: '⚠ 警告',
    info: 'ℹ 信息'
  }
  return titles[props.type]
})
</script>

