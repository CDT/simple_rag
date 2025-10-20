# 组件库结构 (Component Library Structure)

## 📁 完整目录结构

```
frontend/src/
├── components/
│   ├── base/                      # 基础通用组件
│   │   ├── BaseButton.vue         # 按钮组件
│   │   ├── BaseInput.vue          # 输入框组件
│   │   ├── BaseCard.vue           # 卡片组件
│   │   ├── BaseAlert.vue          # 提醒组件
│   │   ├── BasePageHeader.vue     # 页面头部组件
│   │   ├── BaseEmptyState.vue     # 空状态组件
│   │   └── BaseProgressBar.vue    # 进度条组件
│   │
│   ├── layout/                    # 布局组件
│   │   └── AppSidebar.vue         # 应用侧边栏
│   │
│   ├── chat/                      # 聊天相关组件
│   │   └── ChatMessage.vue        # 消息气泡组件
│   │
│   ├── knowledge/                 # 知识库相关组件
│   │   ├── FileUploadZone.vue     # 文件上传区
│   │   └── FileCard.vue           # 文件卡片
│   │
│   ├── settings/                  # 设置相关组件
│   │   ├── RangeSlider.vue        # 范围滑块
│   │   └── NumberInput.vue        # 数字输入框
│   │
│   └── README.md                  # 组件库文档
│
├── views/                         # 页面视图（已重构）
│   ├── Chat.vue                   # 对话页面
│   ├── KnowledgeBase.vue          # 知识库页面
│   └── Settings.vue               # 设置页面
│
├── types/                         # TypeScript 类型定义
│   └── index.ts                   # 统一类型导出
│
├── composables/                   # 可组合函数
│   └── useDarkMode.ts             # 暗色模式
│
└── App.vue                        # 根组件
```

## 🎨 组件分类

### 基础组件 (Base) - 7 个
通用 UI 组件，可在任何地方使用：

1. **BaseButton** - 所有按钮的基础
2. **BaseInput** - 所有输入框的基础
3. **BaseCard** - 所有卡片容器的基础
4. **BaseAlert** - 所有提醒/通知的基础
5. **BasePageHeader** - 所有页面头部的基础
6. **BaseEmptyState** - 所有空状态展示的基础
7. **BaseProgressBar** - 所有进度显示的基础

### 布局组件 (Layout) - 1 个
应用级布局组件：

1. **AppSidebar** - 左侧导航栏

### 功能组件 (Feature-specific) - 5 个

#### 聊天组件 (Chat) - 1 个
1. **ChatMessage** - 聊天消息气泡

#### 知识库组件 (Knowledge) - 2 个
1. **FileUploadZone** - 拖放上传区域
2. **FileCard** - 文件信息卡片

#### 设置组件 (Settings) - 2 个
1. **RangeSlider** - 滑块选择器
2. **NumberInput** - 数字输入（基于 BaseInput）

## 📊 组件依赖关系

```
视图层 (Views)
  ├── App.vue
  │   └── AppSidebar
  │
  ├── Chat.vue
  │   ├── BasePageHeader
  │   ├── BaseEmptyState
  │   ├── ChatMessage
  │   └── BaseButton
  │
  ├── KnowledgeBase.vue
  │   ├── BasePageHeader
  │   ├── BaseCard
  │   ├── FileUploadZone
  │   │   └── BaseButton
  │   ├── FileCard
  │   │   └── BaseButton
  │   ├── BaseProgressBar
  │   ├── BaseAlert
  │   └── BaseEmptyState
  │
  └── Settings.vue
      ├── BasePageHeader
      ├── BaseCard
      ├── BaseInput
      ├── RangeSlider
      ├── NumberInput
      │   └── BaseInput
      ├── BaseButton
      └── BaseAlert
```

## 🔧 组件使用统计

| 组件 | 使用次数 | 使用位置 |
|------|----------|----------|
| BasePageHeader | 4 | App, Chat, KnowledgeBase, Settings |
| BaseCard | 3 | KnowledgeBase, Settings |
| BaseButton | 8+ | 所有页面 |
| BaseInput | 2+ | Settings |
| BaseAlert | 2+ | KnowledgeBase, Settings |
| BaseEmptyState | 2 | Chat, KnowledgeBase |
| BaseProgressBar | 1 | KnowledgeBase |
| AppSidebar | 1 | App |
| ChatMessage | N | Chat (动态列表) |
| FileCard | N | KnowledgeBase (动态列表) |
| FileUploadZone | 1 | KnowledgeBase |
| RangeSlider | 1 | Settings |
| NumberInput | 4 | Settings |

## 🎯 组件设计原则

### 1. 命名规范
- **Base*** - 基础组件前缀
- **App*** - 应用级组件前缀
- 功能组件使用描述性名称（如 ChatMessage, FileCard）

### 2. 职责划分
- **基础组件**: 只负责 UI 展示和基本交互
- **布局组件**: 负责页面结构和布局
- **功能组件**: 包含业务逻辑的特定组件

### 3. Props 设计
- 使用 TypeScript 接口定义
- 提供合理的默认值
- 支持常见的自定义需求

### 4. 样式管理
- 所有样式使用 Tailwind CSS
- 完整支持暗色模式 (`dark:` 类)
- 使用 `transition-colors` 实现平滑过渡

### 5. 事件处理
- 使用 `defineEmits` 定义事件
- 事件命名使用 camelCase
- 避免在组件内部处理业务逻辑

## 📝 扩展指南

### 添加新组件

1. **确定组件分类**
   - 是否为通用基础组件？→ 放入 `base/`
   - 是否为布局组件？→ 放入 `layout/`
   - 是否为特定功能？→ 放入对应功能目录

2. **创建组件文件**
   ```bash
   frontend/src/components/[category]/ComponentName.vue
   ```

3. **编写组件**
   - 使用 `<script setup lang="ts">`
   - 定义 Props 接口
   - 定义 Emits
   - 添加类型注解

4. **更新文档**
   - 在 `components/README.md` 中添加组件文档
   - 包含 Props、Events、Slots 说明
   - 提供使用示例

5. **在视图中使用**
   ```vue
   <script setup lang="ts">
   import ComponentName from '@/components/[category]/ComponentName.vue'
   </script>

   <template>
     <ComponentName :prop="value" @event="handler" />
   </template>
   ```

## 🔍 组件查找指南

需要什么组件？快速查找：

| 需求 | 使用组件 |
|------|----------|
| 按钮 | `BaseButton` |
| 输入框 | `BaseInput` 或 `NumberInput` |
| 卡片容器 | `BaseCard` |
| 提示消息 | `BaseAlert` |
| 页面标题 | `BasePageHeader` |
| 空状态 | `BaseEmptyState` |
| 进度条 | `BaseProgressBar` |
| 侧边栏 | `AppSidebar` |
| 聊天气泡 | `ChatMessage` |
| 文件上传 | `FileUploadZone` |
| 文件列表项 | `FileCard` |
| 滑块 | `RangeSlider` |

## 📦 导出索引

可以创建 `components/index.ts` 统一导出：

```typescript
// 基础组件
export { default as BaseButton } from './base/BaseButton.vue'
export { default as BaseInput } from './base/BaseInput.vue'
export { default as BaseCard } from './base/BaseCard.vue'
export { default as BaseAlert } from './base/BaseAlert.vue'
export { default as BasePageHeader } from './base/BasePageHeader.vue'
export { default as BaseEmptyState } from './base/BaseEmptyState.vue'
export { default as BaseProgressBar } from './base/BaseProgressBar.vue'

// 布局组件
export { default as AppSidebar } from './layout/AppSidebar.vue'

// 聊天组件
export { default as ChatMessage } from './chat/ChatMessage.vue'

// 知识库组件
export { default as FileUploadZone } from './knowledge/FileUploadZone.vue'
export { default as FileCard } from './knowledge/FileCard.vue'

// 设置组件
export { default as RangeSlider } from './settings/RangeSlider.vue'
export { default as NumberInput } from './settings/NumberInput.vue'
```

使用时可以这样导入：

```typescript
import { BaseButton, BaseCard, BaseInput } from '@/components'
```

---

**创建日期**: 2025-10-20
**组件总数**: 13
**覆盖率**: 100%

