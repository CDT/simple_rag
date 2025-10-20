# 🐛 VS Code 调试配置指南

已为您配置好 VS Code 的调试环境，支持前端、后端和全栈调试！

## 📋 配置文件

已创建以下配置文件：

### 1. `.vscode/launch.json` - 调试配置
- 🚀 后端服务器 (Nodemon)
- 🌐 前端应用 (Chrome)
- 🔥 全栈调试（同时启动前后端）

### 2. `.vscode/tasks.json` - 任务配置
- 前端开发服务器任务
- 后端服务器任务

## 🎯 使用方法

### 方式 1：使用调试面板

1. **打开调试面板**
   - 点击左侧活动栏的 🐛 调试图标
   - 或按快捷键 `Ctrl+Shift+D` (Windows/Linux) / `Cmd+Shift+D` (Mac)

2. **选择调试配置**
   
   在顶部下拉菜单中选择：
   
   | 配置名称 | 用途 | 说明 |
   |---------|------|------|
   | 🚀 后端服务器 (Nodemon) | 仅调试后端 | 自动重启，支持断点 |
   | 🌐 前端应用 (Chrome) | 仅调试前端 | 自动打开 Chrome 和开发者工具 |
   | 🔥 全栈调试 | 同时调试前后端 | 最常用的配置 |

3. **开始调试**
   - 点击绿色播放按钮 ▶️
   - 或按 `F5`

### 方式 2：使用快捷键

```
F5          - 开始调试
Ctrl+F5     - 运行（不调试）
Shift+F5    - 停止调试
Ctrl+Shift+F5 - 重启调试
```

## 🚀 后端调试配置

### 配置详情

```json
{
  "type": "node",
  "request": "launch",
  "name": "🚀 后端服务器 (Nodemon)",
  "runtimeExecutable": "nodemon",
  "program": "${workspaceFolder}/backend/server.js",
  "restart": true,
  "console": "integratedTerminal"
}
```

### 功能特点

- ✅ **自动重启** - 代码修改后自动重新加载
- ✅ **断点调试** - 在代码中设置断点
- ✅ **变量查看** - 实时查看变量值
- ✅ **调用堆栈** - 查看函数调用链
- ✅ **控制台输出** - 在集成终端中显示

### 使用示例

1. **设置断点**
   ```javascript
   // backend/routes/chat.js
   router.post('/', async (req, res) => {
     const { message } = req.body;  // 👈 点击行号左侧设置断点
     
     // 当请求到达这里时，调试器会暂停
     console.log('Received message:', message);
   });
   ```

2. **查看变量**
   - 在左侧"变量"面板查看所有局部变量
   - 悬停在代码上查看变量值
   - 在调试控制台输入表达式

3. **条件断点**
   - 右键点击断点
   - 选择"编辑断点" → "条件断点"
   - 例如：`message.includes('test')`

## 🌐 前端调试配置

### 配置详情

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "🌐 前端应用 (Chrome)",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend",
  "sourceMaps": true,
  "runtimeArgs": [
    "--auto-open-devtools-for-tabs"
  ]
}
```

### 功能特点

- ✅ **Chrome 集成** - 自动启动 Chrome 浏览器
- ✅ **开发者工具** - 自动打开 DevTools
- ✅ **Source Maps** - 支持 TypeScript 源码调试
- ✅ **实时重载** - 配合 Vite HMR
- ✅ **Vue DevTools** - 可安装 Vue 浏览器扩展

### 使用示例

1. **设置断点**
   ```typescript
   // frontend/src/views/Chat.vue
   const sendMessage = async () => {
     const messageToSend = newMessage.value; // 👈 设置断点
     
     const response = await axios.post('/api/chat', {
       message: messageToSend
     });
   };
   ```

2. **调试 Vue 组件**
   - 在 `.vue` 文件的 `<script>` 部分设置断点
   - 查看组件状态（ref, computed 等）
   - 追踪事件处理流程

3. **网络请求调试**
   - 在 Chrome DevTools 的 Network 标签查看请求
   - 设置断点在 API 调用前后
   - 查看请求/响应数据

## 🔥 全栈调试配置

### 功能特点

- ✅ **同时启动** - 一键启动前后端
- ✅ **统一控制** - 一次停止所有进程
- ✅ **端到端调试** - 追踪从前端到后端的完整流程

### 使用场景

**场景 1：调试 API 调用**

```typescript
// 1. 前端设置断点
// frontend/src/views/Chat.vue
const sendMessage = async () => {
  debugger; // 👈 断点 1: 准备发送请求
  const response = await axios.post('/api/chat', {
    message: newMessage.value
  });
};

// 2. 后端设置断点
// backend/routes/chat.js
router.post('/', async (req, res) => {
  debugger; // 👈 断点 2: 接收请求
  const { message } = req.body;
  // ...
});
```

**场景 2：调试文件上传**

```typescript
// frontend/src/views/KnowledgeBase.vue
const uploadFile = async (file: File) => {
  debugger; // 👈 前端断点
  const formData = new FormData();
  formData.append('file', file);
  await axios.post('/api/ingest', formData);
};

// backend/routes/ingest.js
router.post('/', upload.single('file'), async (req, res) => {
  debugger; // 👈 后端断点
  const { originalname } = req.file;
  // ...
});
```

## 🛠️ 高级技巧

### 1. 调试控制台

在调试暂停时，可以在调试控制台执行代码：

```javascript
// 后端调试控制台
> req.body
{ message: "这是测试消息" }

> message.length
6

> JSON.stringify(results, null, 2)
"{...}"
```

### 2. 监视表达式

添加监视表达式实时查看值：

```
messages.length
isLoading.value
settings.value.temperature
```

### 3. 日志点

不中断执行，只记录日志：

- 右键点击行号
- 选择"添加日志点"
- 输入消息：`Message: {message}`

### 4. 跳过文件

在 `launch.json` 中配置：

```json
"skipFiles": [
  "<node_internals>/**",
  "${workspaceFolder}/node_modules/**"
]
```

## 📊 调试工作流

### 典型调试流程

```
1. 设置断点
   ↓
2. 启动调试 (F5)
   ↓
3. 触发功能（上传文件、发送消息等）
   ↓
4. 代码在断点处暂停
   ↓
5. 检查变量、调用堆栈
   ↓
6. 单步执行 (F10/F11)
   ↓
7. 继续执行 (F5) 或停止 (Shift+F5)
```

### 常用操作

| 操作 | 快捷键 | 说明 |
|------|--------|------|
| 继续 | `F5` | 继续执行到下一个断点 |
| 单步跳过 | `F10` | 执行下一行（不进入函数） |
| 单步进入 | `F11` | 进入函数内部 |
| 单步跳出 | `Shift+F11` | 跳出当前函数 |
| 重启 | `Ctrl+Shift+F5` | 重新启动调试 |
| 停止 | `Shift+F5` | 停止调试 |

## 🔍 调试场景示例

### 场景 1：调试对话功能

```typescript
// 1. 在前端 Chat.vue 设置断点
const sendMessage = async () => {
  // 断点：检查用户输入
  console.log('User message:', newMessage.value);
  
  const response = await axios.post('/api/chat', {
    message: newMessage.value,
    history
  });
  
  // 断点：检查 API 响应
  console.log('API response:', response.data);
};

// 2. 在后端 chat.js 设置断点
router.post('/', async (req, res) => {
  // 断点：检查请求数据
  const { message, history } = req.body;
  
  // 断点：检查 ChromaDB 查询结果
  const results = await chromaService.query(queryEmbedding, 5);
  
  // 断点：检查 AI 响应
  const response = await deepseekService.chat(messages, context);
});
```

### 场景 2：调试文件上传

```typescript
// 前端 KnowledgeBase.vue
const uploadFile = async (file: File) => {
  // 断点 1：检查文件对象
  console.log('File:', file.name, file.size);
  
  const formData = new FormData();
  formData.append('file', file);
  
  // 断点 2：发送请求前
  const response = await axios.post('/api/ingest', formData);
  
  // 断点 3：检查上传结果
  console.log('Upload result:', response.data);
};

// 后端 ingest.js
router.post('/', upload.single('file'), async (req, res) => {
  // 断点 4：检查上传的文件
  console.log('Uploaded file:', req.file);
  
  // 断点 5：文本提取后
  const processed = await documentProcessor.processDocument(filePath, originalname);
  
  // 断点 6：嵌入生成后
  const embeddings = await deepseekService.getEmbedding(chunk);
});
```

## ⚠️ 常见问题

### 问题 1：Nodemon 未找到

**错误**：`nodemon: command not found`

**解决方案**：
```bash
# 全局安装 nodemon
npm install -g nodemon

# 或在项目中安装
cd backend
npm install --save-dev nodemon
```

### 问题 2：Chrome 未自动打开

**解决方案**：
1. 确保 Chrome 已安装
2. 检查 Chrome 路径
3. 手动指定 Chrome 路径：
   ```json
   {
     "runtimeExecutable": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
   }
   ```

### 问题 3：断点未生效

**可能原因**：
- Source maps 未启用
- 代码未保存
- 调试器未连接

**解决方案**：
- 确认 `vite.config.ts` 中 `sourcemap: true`
- 保存文件后重新启动调试
- 检查调试控制台的错误消息

### 问题 4：前端任务未启动

**解决方案**：
```bash
# 确保前端依赖已安装
cd frontend
npm install

# 手动测试前端服务器
npm run dev
```

## 📚 扩展推荐

### VS Code 扩展

推荐安装以下扩展以提升调试体验：

1. **Vue Language Features (Volar)**
   - Vue 3 官方扩展
   - 更好的 Vue 文件支持

2. **Chrome Debugger**
   - 已内置在 VS Code
   - 浏览器调试支持

3. **ESLint**
   - 代码质量检查
   - 实时错误提示

4. **Error Lens**
   - 行内显示错误
   - 更直观的问题定位

### Chrome 扩展

1. **Vue.js DevTools**
   - 调试 Vue 组件
   - 查看状态和事件

2. **Redux DevTools**
   - 状态管理调试
   - 时间旅行功能

## 🎓 学习资源

### 官方文档

- [VS Code 调试指南](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js 调试](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Chrome 调试协议](https://chromedevtools.github.io/devtools-protocol/)

### 快速参考

**断点类型**：
- 普通断点 - 点击行号
- 条件断点 - 右键 → 条件断点
- 日志点 - 右键 → 日志点

**变量查看**：
- 变量面板 - 自动显示局部变量
- 监视 - 添加自定义表达式
- 悬停 - 鼠标悬停在代码上

**控制流程**：
- F5 - 继续
- F10 - 单步跳过
- F11 - 单步进入
- Shift+F11 - 单步跳出

---

## ✅ 配置完成清单

- [x] `.vscode/launch.json` 已创建
- [x] `.vscode/tasks.json` 已创建
- [x] 后端调试配置已添加
- [x] 前端调试配置已添加
- [x] 全栈调试配置已添加

**现在您可以开始高效调试了！** 🎉

---

## 🚀 快速开始

```
1. 按 F5 或点击调试面板的 ▶️
2. 选择 "🔥 全栈调试"
3. 等待前后端启动
4. 在代码中设置断点
5. 触发功能（上传、对话等）
6. 开始调试！
```

**祝您调试愉快！** 🐛✨

