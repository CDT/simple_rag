<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center text-gray-400 dark:text-gray-500">
      <div class="text-6xl mb-4">{{ icon }}</div>
      <p class="text-lg">{{ title }}</p>
      <p v-if="description" class="text-sm mt-2">{{ description }}</p>
      <div v-if="$slots.action" class="mt-4">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description?: string
}

defineProps<Props>()
</script>

