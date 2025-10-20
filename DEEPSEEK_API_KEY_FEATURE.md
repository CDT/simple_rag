# ✅ DeepSeek API 密钥配置功能

现在可以直接从设置页面配置 DeepSeek API 密钥！

## 🎯 新功能

### 在设置页面配置 API 密钥

不再需要手动编辑 `backend/.env` 文件，现在可以：

1. **在设置页面输入 API 密钥**
2. **密码式输入**（默认隐藏）
3. **显示/隐藏切换按钮**
4. **保存后自动清空输入框**（安全考虑）
5. **直接链接到获取密钥的网站**

## 📸 界面展示

### API 配置部分

```
🔑 API 配置

API 提供商
[DeepSeek                    ] (禁用)

DeepSeek API 密钥
[••••••••••••••••••••••••••••] [显示]
从 platform.deepseek.com 获取您的 API 密钥

温度
[精确 ←--●--------→ 创造性]
        0.7

最大令牌数
[2000                        ]
```

## 🔒 安全特性

1. **密码式输入**
   - 默认情况下，API 密钥以点号（••••）显示
   - 防止他人偷看

2. **显示/隐藏切换**
   - 点击"显示"按钮查看完整密钥
   - 点击"隐藏"按钮恢复遮蔽

3. **保存后清空**
   - 成功保存后自动清空输入框
   - 避免密钥长时间显示在界面上

4. **运行时更新**
   - 密钥直接更新到 `process.env.DEEPSEEK_API_KEY`
   - 无需重启服务器即可生效

## 💡 使用方法

### 1. 获取 API 密钥

访问 [https://platform.deepseek.com](https://platform.deepseek.com)：
- 注册/登录账号
- 进入 API 密钥管理
- 创建新密钥
- 复制密钥（格式：`sk-xxxxxxxxxx...`）

### 2. 在应用中配置

1. 打开应用，进入**设置**页面
2. 找到 **API 配置** 部分
3. 在 **DeepSeek API 密钥** 输入框中粘贴您的密钥
4. 点击**保存设置**按钮
5. 等待成功提示

### 3. 验证配置

1. 前往**知识库**页面
2. 上传一个文档（如 `example_documents/company_info.txt`）
3. 前往**对话**页面
4. 输入问题测试（如："这个文档讲了什么？"）
5. 如果收到回复，说明 API 密钥配置成功！

## 🔧 技术实现

### 前端 (Settings.vue)

```typescript
// 响应式状态
const apiKey = ref('')
const showApiKey = ref(false)

// 保存时包含 API 密钥
const saveSettings = async () => {
  const payload = {
    ...settings.value,
    apiKey: apiKey.value || undefined
  }
  await axios.put('/api/settings', payload)
  
  // 安全清空
  if (apiKey.value) {
    apiKey.value = ''
    showApiKey.value = false
  }
}
```

### 后端 (routes/settings.js)

```javascript
router.put('/', (req, res) => {
  const settings = req.body
  
  // 更新环境变量
  if (settings.apiKey) {
    process.env.DEEPSEEK_API_KEY = settings.apiKey
    console.log('DeepSeek API key updated')
    
    // 从响应中删除，不返回给前端
    delete settings.apiKey
  }
  
  res.json({
    success: true,
    message: 'Settings updated successfully'
  })
})
```

## ⚠️ 重要提示

### 1. 密钥安全

- ✅ **不要**将 API 密钥提交到 Git
- ✅ **不要**在公开场所分享密钥
- ✅ 定期轮换 API 密钥
- ✅ 为不同环境使用不同密钥

### 2. 环境变量优先级

配置优先级（从高到低）：
1. 通过设置页面更新的运行时配置
2. `backend/.env` 文件中的配置
3. 系统环境变量

### 3. 持久化说明

**当前实现：**
- API 密钥更新到 `process.env.DEEPSEEK_API_KEY`
- 在当前运行的进程中立即生效
- **重启服务器后会丢失**，需重新配置

**生产环境建议：**
- 将密钥保存到数据库
- 或更新 `.env` 文件（需要文件写权限）
- 或使用专业的密钥管理服务（如 AWS Secrets Manager）

## 🚀 改进建议

### 未来可以添加：

1. **密钥验证**
   - 保存前测试 API 密钥是否有效
   - 调用 DeepSeek API 进行验证

2. **密钥管理**
   - 显示当前密钥状态（已配置/未配置）
   - 密钥有效期提醒
   - 使用统计（已用额度）

3. **持久化存储**
   - 将密钥加密保存到数据库
   - 自动备份配置

4. **多环境支持**
   - 开发环境密钥
   - 生产环境密钥
   - 一键切换

## 📋 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `frontend/src/views/Settings.vue` | 添加 API 密钥输入框和显示/隐藏功能 |
| `backend/routes/settings.js` | 处理 API 密钥更新逻辑 |

## ✨ 用户体验改进

**之前：**
```bash
# 需要手动编辑文件
nano backend/.env
# 找到这一行
DEEPSEEK_API_KEY=your_key_here
# 手动粘贴密钥
# 保存退出
# 重启服务器
```

**现在：**
```
1. 打开设置页面
2. 粘贴密钥
3. 点击保存
4. 完成！✅
```

---

**现在配置 DeepSeek API 密钥更加简单便捷了！** 🎉

