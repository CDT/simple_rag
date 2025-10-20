<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2 animate-spin">⏳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button'
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600',
    secondary: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  }
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2',
    lg: 'px-6 py-3'
  }
  
  const width = props.fullWidth ? 'w-full' : ''
  
  return [base, variants[props.variant], sizes[props.size], width].join(' ')
})
</script>

