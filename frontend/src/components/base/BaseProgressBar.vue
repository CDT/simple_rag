<template>
  <div class="w-full">
    <div v-if="label || value !== undefined" class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</span>
      <span v-if="value !== undefined" class="text-sm text-gray-500 dark:text-gray-400">
        {{ Math.round(value) }}%
      </span>
    </div>
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
        :class="{ 'animate-pulse': indeterminate }"
        :style="{ width: indeterminate ? '100%' : `${value}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value?: number
  label?: string
  indeterminate?: boolean
}

withDefaults(defineProps<Props>(), {
  indeterminate: false
})
</script>

