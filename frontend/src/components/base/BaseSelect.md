# BaseSelect Component

A custom select component with dark theme support and smooth animations.

## Features

- ✨ **Smooth Animations**: Dropdown appears with scale and fade transitions
- 🎨 **Dark Theme Support**: Automatically adapts to dark mode
- ♿ **Accessible**: Keyboard navigation and click-outside handling
- 🎯 **Flexible Options**: Supports simple values or object-based options
- 📝 **Creatable Mode**: Allow users to type custom values with autocomplete suggestions
- 🏷️ **Built-in Label**: Optional label with required indicator
- ❌ **Clearable**: Optional clear button to reset the selected value
- 📱 **Responsive**: Adapts to container width
- ⚡ **Performance**: Staggered animation for options

## Usage

### Basic Usage (Simple Values)

```vue
<template>
  <BaseSelect
    v-model="selectedValue"
    :options="['Option 1', 'Option 2', 'Option 3']"
    placeholder="Select an option"
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseSelect from './components/base/BaseSelect.vue'

const selectedValue = ref('')
</script>
```

### With Label and Required Indicator

```vue
<template>
  <BaseSelect
    v-model="selectedValue"
    :options="['Option 1', 'Option 2', 'Option 3']"
    label="Select an option"
    placeholder="Choose..."
    required
  />
</template>
```

### Advanced Usage (Object Options)

```vue
<template>
  <BaseSelect
    v-model="selectedCollection"
    :options="collectionOptions"
    label="筛选集合"
    placeholder="全部集合"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseSelect from './components/base/BaseSelect.vue'

const selectedCollection = ref('')
const collections = ref(['Collection 1', 'Collection 2'])

const collectionOptions = computed(() => [
  { label: '全部集合', value: '' },
  ...collections.value.map(c => ({ label: c, value: c }))
])
</script>
```

### Creatable Mode (Custom Values)

```vue
<template>
  <BaseSelect
    v-model="newCollection"
    :options="collections"
    label="集合"
    placeholder="输入新集合名称或选择现有集合"
    required
    creatable
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseSelect from './components/base/BaseSelect.vue'

const newCollection = ref('')
const collections = ref(['Collection A', 'Collection B'])
// Users can type a new collection name or select from existing ones
</script>
```

### With Clearable Button

```vue
<template>
  <BaseSelect
    v-model="selectedValue"
    :options="['Option 1', 'Option 2', 'Option 3']"
    label="Select an option"
    placeholder="Choose..."
    clearable
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseSelect from './components/base/BaseSelect.vue'

const selectedValue = ref('Option 1')
// User can click the X button to clear the selection
</script>
```

### With Disabled State

```vue
<template>
  <BaseSelect
    v-model="selectedValue"
    :options="options"
    :disabled="isLoading"
    placeholder="Loading..."
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | - | The selected value (v-model) |
| `options` | `Array<SelectOption \| string \| number>` | `[]` | Array of options |
| `label` | `string` | `''` | Optional label text displayed above the select |
| `placeholder` | `string` | `'请选择'` | Placeholder text when no value selected |
| `disabled` | `boolean` | `false` | Whether the select is disabled |
| `required` | `boolean` | `false` | Shows a red asterisk (*) next to the label |
| `creatable` | `boolean` | `false` | Allows typing custom values with autocomplete |
| `clearable` | `boolean` | `false` | Shows a clear button (X) when a value is selected |

## Option Format

### Simple Format
```typescript
const options = ['Option 1', 'Option 2', 123]
```

### Object Format
```typescript
interface SelectOption {
  label: string
  value: string | number
}

const options: SelectOption[] = [
  { label: 'Display Text', value: 'internal_value' },
  { label: 'Another Option', value: 2 }
]
```

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `update:modelValue` | `value: string \| number` | Emitted when selection changes |

## Clearable Behavior

When `clearable` is set to `true`:

1. A clear button (X icon) appears when there's a selected value
2. The clear button is hidden when disabled or when there's no value
3. Clicking the clear button sets the value to an empty string (`''`)
4. The clear button has hover effects for better UX
5. Works in both creatable and non-creatable modes
6. In creatable mode, the clear button appears between the input and dropdown arrow
7. In non-creatable mode, the clear button appears between the text and dropdown arrow

## Creatable Mode Behavior

When `creatable` is set to `true`:

1. The select becomes an input field where users can type
2. As users type, the dropdown filters options based on the input
3. Users can select from filtered options or keep their typed value
4. The dropdown only shows when there are matching options
5. Clicking a dropdown option replaces the input value

This is perfect for scenarios where you want to allow both selecting existing values and creating new ones.

## Styling

The component uses Tailwind CSS classes and automatically adapts to dark mode:

- **Light mode**: White background with gray borders
- **Dark mode**: Dark gray background with lighter borders
- **Focus state**: Blue ring and border
- **Hover state**: Lighter background for options
- **Selected state**: Blue background with checkmark
- **Label**: Medium font weight with dark theme support
- **Required indicator**: Red asterisk
- **Clear button**: 
  - Gray X icon with rounded hover background
  - Smooth transition on hover
  - Adapts to dark theme
  - Positioned to not interfere with dropdown arrow

## Animation Details

### Dropdown Animation
- **Enter**: 200ms ease-out with scale and fade
- **Leave**: 150ms ease-in with scale and fade
- **Transform origin**: Top center for natural dropdown feel

### Options Animation
- Each option has a staggered slide-in animation
- Delay increases by 20ms per option
- Creates a cascading reveal effect

## Accessibility

- Click outside to close dropdown
- Visual feedback for focus, hover, and selected states
- Disabled state with reduced opacity
- Smooth transitions for all state changes

## Example in Real Application

See `frontend/src/views/KnowledgeBase.vue` for a complete implementation example with dynamic options and filtering.

