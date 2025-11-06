<template>
  <div class="flex items-center gap-4">
    <!-- Label -->
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative flex-1" ref="selectRef">
      <!-- Creatable input -->
      <div v-if="creatable" class="relative">
        <input
          :value="modelValue"
          @input="handleInput"
          @focus="isOpen = true"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200"
          :class="[
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
              : 'bg-white dark:bg-gray-700',
            isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/30'
              : 'border-gray-300 dark:border-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 focus:border-blue-500',
            'text-gray-900 dark:text-gray-100',
            clearable ? 'pr-16' : 'pr-10'
          ]"
        />
        <!-- Clear button -->
        <button
          v-if="showClearButton"
          @click="clearValue"
          type="button"
          class="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Dropdown arrow -->
        <svg
          class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 pointer-events-none"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Selected value display (non-creatable) -->
      <div v-else class="relative">
        <button
          type="button"
          :disabled="disabled"
          @click="toggleDropdown"
          class="w-full px-3 py-2 text-left border rounded-md shadow-sm transition-all duration-200 flex items-center justify-between"
          :class="[
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
              : 'bg-white dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer',
            isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/30'
              : 'border-gray-300 dark:border-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 focus:border-blue-500',
            clearable ? 'pr-16' : 'pr-10'
          ]"
        >
          <span class="block truncate text-gray-900 dark:text-gray-100">
            {{ displayValue }}
          </span>
        </button>
        <!-- Clear button -->
        <button
          v-if="showClearButton"
          @click="clearValue"
          type="button"
          class="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 z-10"
        >
          <svg
            class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Dropdown arrow -->
        <svg
          class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 pointer-events-none"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

    <!-- Dropdown options -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-show="isOpen && filteredOptions.length > 0"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden"
      >
        <div class="max-h-60 overflow-y-auto custom-scrollbar">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            @click="selectOption(option)"
            class="px-3 py-2 cursor-pointer transition-all duration-150 flex items-center justify-between"
            :class="[
              isSelected(option)
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
              { 'animate-option': isOpen }
            ]"
            :style="{ 'animation-delay': `${index * 20}ms` }"
          >
            <span class="block truncate">{{ getOptionLabel(option) }}</span>
            <svg
              v-if="isSelected(option)"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Array<SelectOption | string | number>
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  creatable?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '请选择',
  disabled: false,
  required: false,
  creatable: false,
  clearable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const displayValue = computed(() => {
  const selected = props.options.find(opt => getOptionValue(opt) === props.modelValue)
  if (selected) {
    return getOptionLabel(selected)
  }
  return props.placeholder
})

const filteredOptions = computed(() => {
  if (!props.creatable || !props.modelValue) {
    return props.options
  }
  const searchValue = String(props.modelValue).toLowerCase()
  return props.options.filter(opt => 
    getOptionLabel(opt).toLowerCase().includes(searchValue)
  )
})

const showClearButton = computed(() => {
  return props.clearable && !props.disabled && props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
})

const getOptionValue = (option: SelectOption | string | number): string | number => {
  if (typeof option === 'object') {
    return option.value
  }
  return option
}

const getOptionLabel = (option: SelectOption | string | number): string => {
  if (typeof option === 'object') {
    return option.label
  }
  return String(option)
}

const isSelected = (option: SelectOption | string | number): boolean => {
  return getOptionValue(option) === props.modelValue
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const selectOption = (option: SelectOption | string | number) => {
  emit('update:modelValue', getOptionValue(option))
  isOpen.value = false
}

const clearValue = (event: Event) => {
  event.stopPropagation()
  emit('update:modelValue', '')
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-900;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-option {
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
}
</style>

