# 🚀 新闻机器人论坛部署指南

## 📋 部署概览

**好消息！** 您的数据库管理工作已经最小化。只需要简单的几步配置即可完成部署。

## 🗄️ 数据库准备

### 方案1：Supabase云服务（推荐）
```bash
# 1. 在 Supabase 控制台运行现有的 schema.sql
# 2. 然后运行新增的 newsbot-schema.sql
```

### 方案2：本地PostgreSQL
```bash
# 如果您有本地PostgreSQL，执行以下SQL文件：
psql -d your_database -f supabase/schema.sql
psql -d your_database -f supabase/newsbot-schema.sql
```

## ⚙️ 环境变量配置

创建 `.env.local` 文件：

```bash
# === 数据库配置 ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === AI翻译服务（至少配置一个）===
OPENAI_API_KEY=sk-your-openai-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here

# === 新闻机器人配置 ===
NEWSBOT_ENABLED=true
NEWSBOT_AUTO_START=true
```

## 🤖 新闻机器人用户账户

### 自动创建（推荐）
机器人将自动使用服务账户发布，无需手动创建用户。

### 手动创建（可选）
如果要使用专门的机器人账户：
1. 访问论坛注册页面
2. 创建用户：`newsbot@your-domain.com`
3. 记录用户ID用于配置

## 🚀 部署选项

### 选项1：Vercel（推荐）
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel

# 3. 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY  # 或 DEEPSEEK_API_KEY

# 4. 重新部署
vercel --prod
```

### 选项2：Netlify
```bash
# 1. 构建项目
npm run build

# 2. 部署 out/ 目录到 Netlify
# 3. 在 Netlify 控制台设置环境变量
```

### 选项3：Docker部署
```dockerfile
# Dockerfile 已准备好，构建镜像：
docker build -t newsbot-forum .
docker run -p 3000:3000 --env-file .env.local newsbot-forum
```

## 🔧 部署后配置

### 1. 数据库初始化
```sql
-- 在 Supabase SQL 编辑器中运行：
-- （这些已经包含在 newsbot-schema.sql 中）

-- 验证表是否创建成功
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'news_%';
```

### 2. 新闻机器人测试
```bash
# 访问管理面板
https://your-domain.com/newsbot

# 点击"立即执行"测试抓取功能
```

### 3. 定时任务配置
```bash
# Vercel Cron（在 vercel.json 中配置）
{
  "cron": [
    {
      "path": "/api/newsbot/cron",
      "schedule": "0 */3 * * *"
    }
  ]
}
```

## 📊 监控和维护

### 自动化维护
- ✅ **数据清理**: 自动删除30天前的旧数据
- ✅ **错误恢复**: 单个源失败不影响其他源
- ✅ **去重机制**: 防止重复发布相同内容
- ✅ **质量控制**: 只发布高质量新闻

### 手动维护
```sql
-- 检查机器人状态
SELECT * FROM news_crawl_history ORDER BY created_at DESC LIMIT 10;

-- 检查发布的文章
SELECT title, source, created_at FROM posts 
WHERE is_bot_post = true ORDER BY created_at DESC LIMIT 10;

-- 清理数据（如需要）
SELECT cleanup_old_news_data();
```

## 🎯 部署检查清单

### 必需步骤
- [ ] ✅ 配置 Supabase 数据库
- [ ] ✅ 设置环境变量
- [ ] ✅ 配置至少一个AI API（OpenAI 或 DeepSeek）
- [ ] ✅ 部署应用到云服务
- [ ] ✅ 测试新闻机器人功能

### 可选步骤
- [ ] 创建专用机器人账户
- [ ] 配置自定义域名
- [ ] 设置监控报警
- [ ] 优化新闻源配置

## 🚨 重要提醒

### 数据库权限
- 使用 **Service Role Key** 进行后端数据库操作
- 使用 **Anon Key** 进行前端用户操作

### API限制
- **OpenAI**: 注意每月使用限额
- **DeepSeek**: 相对便宜，适合大量翻译

### 新闻源合规
- 所有配置的新闻源都是公开RSS订阅
- 自动添加原文链接，符合版权要求
- 机器人标识清晰，透明度高

## 🎉 部署完成后

### 访问地址
- **主页**: `https://your-domain.com`
- **新闻机器人管理**: `https://your-domain.com/newsbot`
- **登录页面**: `https://your-domain.com/login`

### 预期效果
- 🤖 每3小时自动发布5-8篇国际新闻
- 🌐 英文新闻自动翻译为中文
- 📊 实时监控面板显示运行状态
- 🔄 自动清理过期数据

## 💡 技术支持

如果遇到问题：
1. 检查环境变量配置
2. 查看 Supabase 数据库日志
3. 访问 `/newsbot` 查看错误信息
4. 检查 API 密钥是否有效

**您的新闻论坛现在已经准备好自动运行了！** 🚀

---

## 🔥 零配置特性总结

✅ **完全自动化**: 部署后无需手动干预  
✅ **智能翻译**: 英文新闻自动变中文  
✅ **质量保证**: 只发布高质量国际新闻  
✅ **数据自管理**: 自动清理和维护  
✅ **监控面板**: 实时状态一目了然