<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <slot name="suffix" />
    </div>
    <p v-if="hint" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {{ hint }}
    </p>
    <p v-if="error" class="text-xs text-red-500 dark:text-red-400 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  inputId?: string
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

defineEmits(['update:modelValue'])

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  const colors = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500'
  const state = props.disabled ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''
  const errorState = props.error ? 'border-red-500 dark:border-red-400' : ''
  
  return [base, colors, state, errorState].filter(Boolean).join(' ')
})
</script>
