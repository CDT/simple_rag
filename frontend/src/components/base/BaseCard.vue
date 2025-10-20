<template>
  <div :class="cardClasses">
    <div v-if="title || $slots.header" class="mb-4">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <span v-if="icon" class="mr-2">{{ icon }}</span>
          {{ title }}
        </h3>
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  icon?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: true
})

const cardClasses = computed(() => {
  const base = 'bg-white dark:bg-gray-800 rounded-lg transition-colors'
  const shadowClass = props.shadow ? 'shadow-md' : ''
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return [base, shadowClass, paddings[props.padding]].filter(Boolean).join(' ')
})
</script>

