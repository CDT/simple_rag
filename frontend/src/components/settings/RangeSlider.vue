<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
    </label>
    <input
      :value="modelValue"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="w-full accent-primary-600 dark:accent-primary-500"
      @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
    />
    <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
      <span>{{ minLabel }}</span>
      <span class="font-semibold text-gray-700 dark:text-gray-300">{{ modelValue }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  label?: string
  min?: number
  max?: number
  step?: number
  minLabel?: string
  maxLabel?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  minLabel: '',
  maxLabel: '',
  disabled: false
})

defineEmits(['update:modelValue'])
</script>

