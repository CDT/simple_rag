<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

