# 组件库文档 (Component Library Documentation)

本文档介绍了应用中所有可复用的 UI 组件。

## 目录

- [基础组件 (Base Components)](#基础组件-base-components)
- [布局组件 (Layout Components)](#布局组件-layout-components)
- [聊天组件 (Chat Components)](#聊天组件-chat-components)
- [知识库组件 (Knowledge Base Components)](#知识库组件-knowledge-base-components)
- [设置组件 (Settings Components)](#设置组件-settings-components)

---

## 基础组件 (Base Components)

### BaseButton

通用按钮组件，支持多种变体和状态。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | 按钮样式变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否显示加载状态 |
| `fullWidth` | `boolean` | `false` | 是否全宽 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 按钮类型 |

**Events:**

- `click` - 点击事件

**示例:**

```vue
<BaseButton variant="primary" @click="handleClick">
  点击我
</BaseButton>

<BaseButton variant="danger" :loading="isLoading">
  删除
</BaseButton>
```

---

### BaseInput

通用输入框组件，支持多种类型和验证。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | - | 输入值 (v-model) |
| `type` | `string` | `'text'` | 输入类型 |
| `label` | `string` | - | 标签文本 |
| `placeholder` | `string` | - | 占位符文本 |
| `hint` | `string` | - | 提示文本 |
| `error` | `string` | - | 错误信息 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `required` | `boolean` | `false` | 是否必填 |
| `min` | `number` | - | 最小值（number 类型） |
| `max` | `number` | - | 最大值（number 类型） |
| `step` | `number` | - | 步长（number 类型） |

**Events:**

- `update:modelValue` - 值变更事件

**示例:**

```vue
<BaseInput
  v-model="username"
  label="用户名"
  placeholder="请输入用户名"
  required
/>

<BaseInput
  v-model="age"
  type="number"
  label="年龄"
  :min="0"
  :max="120"
/>
```

---

### BaseCard

通用卡片容器组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 卡片标题 |
| `icon` | `string` | - | 标题图标 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |
| `shadow` | `boolean` | `true` | 是否显示阴影 |

**Slots:**

- `header` - 自定义头部内容
- `default` - 卡片主体内容

**示例:**

```vue
<BaseCard title="用户信息" icon="👤">
  <p>这是卡片内容</p>
</BaseCard>

<BaseCard>
  <template #header>
    <h3>自定义头部</h3>
  </template>
  <p>卡片内容</p>
</BaseCard>
```

---

### BaseAlert

通用提醒/通知组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | 提醒类型 |
| `title` | `string` | - | 标题（默认根据类型自动设置） |
| `message` | `string` | - | 消息内容 |
| `show` | `boolean` | `true` | 是否显示 |

**示例:**

```vue
<BaseAlert type="success" message="操作成功！" />

<BaseAlert 
  type="warning" 
  title="警告"
  message="请谨慎操作"
/>
```

---

### BasePageHeader

通用页面头部组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 页面标题 |
| `subtitle` | `string` | - | 页面副标题 |

**Slots:**

- `actions` - 头部右侧操作区

**示例:**

```vue
<BasePageHeader title="设置" subtitle="配置您的应用">
  <template #actions>
    <BaseButton>保存</BaseButton>
  </template>
</BasePageHeader>
```

---

### BaseEmptyState

空状态展示组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | - | 图标 emoji |
| `title` | `string` | - | 标题 |
| `description` | `string` | - | 描述文本 |

**Slots:**

- `action` - 操作按钮区域

**示例:**

```vue
<BaseEmptyState 
  icon="📚" 
  title="暂无文档" 
  description="请上传您的第一个文档"
>
  <template #action>
    <BaseButton>上传文档</BaseButton>
  </template>
</BaseEmptyState>
```

---

### BaseProgressBar

进度条组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | - | 进度值 (0-100) |
| `label` | `string` | - | 标签文本 |
| `indeterminate` | `boolean` | `false` | 是否为不确定进度 |

**示例:**

```vue
<BaseProgressBar :value="75" label="上传中..." />

<BaseProgressBar indeterminate label="处理中..." />
```

---

## 布局组件 (Layout Components)

### AppSidebar

应用侧边栏组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appTitle` | `string` | `'RAG 应用'` | 应用标题 |
| `appSubtitle` | `string` | `'知识库问答'` | 应用副标题 |
| `menuItems` | `MenuItem[]` | - | 菜单项数组 |
| `isDark` | `boolean` | - | 是否为暗色模式 |
| `isConnected` | `boolean` | - | 连接状态 |
| `version` | `string` | `'1.0.0'` | 版本号 |

**MenuItem 接口:**

```typescript
interface MenuItem {
  name: string
  path: string
  icon: string
}
```

**Events:**

- `toggleDarkMode` - 切换暗色模式事件

**示例:**

```vue
<AppSidebar
  :menu-items="menuItems"
  :is-dark="isDark"
  :is-connected="isConnected"
  @toggle-dark-mode="toggleDarkMode"
/>
```

---

## 聊天组件 (Chat Components)

### ChatMessage

聊天消息气泡组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `role` | `'user' \| 'assistant'` | - | 消息角色 |
| `content` | `string` | - | 消息内容 |
| `sources` | `Source[]` | - | 引用来源 |

**Source 接口:**

```typescript
interface Source {
  fileName: string
  chunkIndex: number
  text: string
  relevance?: string
}
```

**示例:**

```vue
<ChatMessage
  role="user"
  content="这是用户消息"
/>

<ChatMessage
  role="assistant"
  content="这是助手回复"
  :sources="sources"
/>
```

---

## 知识库组件 (Knowledge Base Components)

### FileUploadZone

文件上传区域组件，支持拖放上传。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | `'📄'` | 图标 emoji |
| `title` | `string` | `'拖放文件到此处，或点击选择'` | 标题文本 |
| `subtitle` | `string` | `'支持格式：.txt、.pdf、.docx'` | 副标题文本 |
| `buttonText` | `string` | `'选择文件'` | 按钮文本 |
| `accept` | `string` | `'.txt,.pdf,.docx'` | 接受的文件类型 |
| `multiple` | `boolean` | `false` | 是否支持多文件 |
| `disabled` | `boolean` | `false` | 是否禁用 |

**Events:**

- `upload` - 文件上传事件，传递 `File[]`

**示例:**

```vue
<FileUploadZone
  :disabled="isUploading"
  @upload="handleUpload"
/>
```

---

### FileCard

文件卡片组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fileName` | `string` | - | 文件名 |
| `chunkCount` | `number` | - | 片段数量 |
| `uploadDate` | `string` | - | 上传日期 |
| `isDeleting` | `boolean` | `false` | 是否正在删除 |

**Events:**

- `delete` - 删除事件

**示例:**

```vue
<FileCard
  file-name="文档.pdf"
  :chunk-count="10"
  upload-date="2025-10-20T12:00:00Z"
  :is-deleting="deletingFileId === file.id"
  @delete="handleDelete"
/>
```

---

## 设置组件 (Settings Components)

### RangeSlider

范围滑块组件。

**Props:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `number` | - | 当前值 (v-model) |
| `label` | `string` | - | 标签文本 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `minLabel` | `string` | `''` | 最小值标签 |
| `maxLabel` | `string` | `''` | 最大值标签 |
| `disabled` | `boolean` | `false` | 是否禁用 |

**Events:**

- `update:modelValue` - 值变更事件

**示例:**

```vue
<RangeSlider
  v-model="temperature"
  label="温度"
  :min="0"
  :max="1"
  :step="0.1"
  min-label="精确"
  max-label="创造性"
/>
```

---

### NumberInput

数字输入框组件（基于 BaseInput）。

**Props:**

继承 `BaseInput` 的所有属性，并针对 `type="number"` 进行了优化。

**示例:**

```vue
<NumberInput
  v-model="maxTokens"
  label="最大Token数"
  :min="100"
  :max="4000"
  :step="100"
/>
```

---

## 设计原则

1. **一致性**: 所有组件遵循统一的设计语言和 Tailwind CSS 类命名规范
2. **暗色模式**: 所有组件完全支持暗色模式，使用 `dark:` 前缀类
3. **可访问性**: 提供适当的 ARIA 属性和语义化 HTML
4. **响应式**: 组件在不同屏幕尺寸下都能正常工作
5. **类型安全**: 所有组件都使用 TypeScript 编写，提供完整的类型定义

## 使用建议

- 优先使用组件库中的组件，而不是直接编写 HTML + Tailwind
- 如需自定义样式，使用组件提供的 props 而不是覆盖样式
- 保持组件的单一职责原则
- 新增组件时，请更新此文档

---

**最后更新**: 2025-10-20

