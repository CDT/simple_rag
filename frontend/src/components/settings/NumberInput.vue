<template>
  <BaseInput
    :model-value="modelValue"
    type="number"
    :label="label"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    @update:model-value="$emit('update:modelValue', $event === '' ? 0 : parseFloat($event))"
  />
</template>

<script setup lang="ts">
import BaseInput from '../base/BaseInput.vue'

interface Props {
  modelValue: number
  label?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  step?: number
}

defineProps<Props>()
defineEmits(['update:modelValue'])
</script>

