# 🚂 Railway 部署指南 - AI 对话功能配置

## 问题症状

如果你遇到以下问题：
- ✅ 在 Railway 环境变量中添加了 `OPENAI_API_KEY`
- ❌ 但聊天页面仍然显示"API Key 未配置"
- ❌ AI 对话功能无法正常工作

## 🔍 快速诊断

### 步骤1: 访问诊断页面
在你的应用 URL 后添加 `/diagnostic`，例如：
```
https://your-app.railway.app/diagnostic
```

### 步骤2: 检查环境变量状态
诊断页面会显示：
- OpenAI API Key: 配置已设置 (sk-...1234) ✅ 或 未配置 ❌
- DeepSeek API Key: 配置已设置 (sk-...5678) ✅ 或 未配置 ❌

### 步骤3: 测试 API 连接
点击"测试 OpenAI"或"测试 DeepSeek"按钮，查看实际连接结果。

## 🛠 Railway 环境变量配置

### 正确的配置步骤

1. **登录 Railway Dashboard**
   - 打开 [railway.app](https://railway.app)
   - 选择你的项目

2. **进入变量设置**
   - 点击项目名称
   - 选择 "Variables" 标签页

3. **添加环境变量**
   ```bash
   # 必需：至少配置其中一个
   OPENAI_API_KEY=sk-proj-your-openai-key-here
   DEEPSEEK_API_KEY=sk-your-deepseek-key-here
   
   # 可选：如果使用数据库功能
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **重新部署**
   - 添加变量后，Railway 会自动重新部署
   - 等待部署完成（通常 2-3 分钟）

## 🚨 常见配置错误

### 错误1: 变量名称错误
❌ 错误写法：
```bash
OPENAI_KEY=sk-...          # 缺少 "API"
OPENAI_API=sk-...          # 缺少 "KEY"  
OpenAI_API_KEY=sk-...      # 大小写错误
```

✅ 正确写法：
```bash
OPENAI_API_KEY=sk-...      # 完全大写，用下划线分隔
DEEPSEEK_API_KEY=sk-...    # 完全大写，用下划线分隔
```

### 错误2: 密钥格式问题
❌ 常见问题：
- 密钥前后有空格
- 密钥被截断或不完整
- 使用了过期的密钥

✅ 正确格式：
```bash
# OpenAI 密钥通常以 sk-proj- 或 sk- 开头
OPENAI_API_KEY=sk-proj-abcd1234...xyz

# DeepSeek 密钥通常以 sk- 开头  
DEEPSEEK_API_KEY=sk-abcd1234...xyz
```

### 错误3: 部署时机问题
❌ 问题：添加变量前就部署了应用
✅ 解决：添加环境变量后，等待 Railway 自动重新部署

## 🔑 获取 API 密钥

### OpenAI API 密钥
1. 访问 [platform.openai.com](https://platform.openai.com)
2. 登录/注册账户
3. 点击 "API Keys" → "Create new secret key"
4. 复制密钥（以 `sk-proj-` 或 `sk-` 开头）

### DeepSeek API 密钥（推荐，更便宜）
1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册账户
3. 获取 API 密钥（以 `sk-` 开头）

## 🧪 验证配置

### 方法1: 使用诊断工具
1. 访问 `https://your-app.railway.app/diagnostic`
2. 查看环境变量状态
3. 点击"测试 OpenAI"或"测试 DeepSeek"
4. 确认显示"连接成功"

### 方法2: 查看应用日志
1. 在 Railway Dashboard 中选择 "Logs" 标签
2. 发送一条 AI 消息
3. 查找以下日志：
   ```
   [Chat API] Configuration - Provider: openai, API Key: Present
   [Chat API] Making request to openai API...
   [Chat API] Response status: 200 OK
   ```

## 🚀 部署后测试流程

1. **访问聊天页面**
   ```
   https://your-app.railway.app/chat
   ```

2. **切换到 AI 模式**
   - 点击"🤖 AI 对话"按钮
   - 选择 AI 提供商（OpenAI 或 DeepSeek）

3. **发送测试消息**
   - 输入"你好"或任何问题
   - 等待 AI 响应

4. **检查结果**
   - ✅ 成功：收到 AI 回复
   - ❌ 失败：显示错误信息，使用诊断工具排查

## 💡 其他注意事项

### Railway 特定配置
- Railway 会自动检测 Next.js 项目
- 无需额外的 Dockerfile 或 railway.toml
- 环境变量会在每次部署时重新加载

### 安全建议
- 不要在代码中硬编码 API 密钥
- 定期检查 API 密钥使用情况
- 考虑设置使用限额避免意外费用

### 故障排除
如果问题仍然存在：
1. 检查 Railway 项目状态是否正常
2. 确认账户余额充足
3. 尝试重新生成 API 密钥
4. 联系 Railway 或 AI 服务提供商支持

---

## 📞 获取帮助

如果按照此指南仍无法解决问题：
1. 访问诊断页面截图环境变量状态
2. 复制错误信息
3. 检查 Railway 部署日志
4. 提供以上信息寻求技术支持

**记住：诊断工具是你的最佳朋友！** 🔧