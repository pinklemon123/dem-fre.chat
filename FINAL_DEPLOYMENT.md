# 🤖 自动新闻机器人 - 最终部署指南

## ✅ 部署准备就绪！

### 📋 系统概况
- **英美新闻源**: BBC World News, CNN International, Reuters, The Guardian, Associated Press
- **自动翻译**: OpenAI GPT-3.5/4 或 DeepSeek API 英译中
- **发布频率**: 每3小时自动运行一次
- **文章数量**: 每次处理5-8篇高质量新闻
- **完全自主**: 无需任何手动配置或干预

## 🚀 立即部署 (推荐: Vercel)

### 1. 环境变量设置
在Vercel Dashboard中设置以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥

# AI翻译API (选择其一)
OPENAI_API_KEY=你的OpenAI密钥
# 或者
DEEPSEEK_API_KEY=你的DeepSeek密钥

# 新闻机器人配置
NEWS_BOT_USER_ID=newsbot-official  # 机器人账号ID
NEWS_BOT_USERNAME=NewsBot          # 机器人用户名
PYTHON_PATH=python3                # Python执行路径

# 可选安全配置
CRON_SECRET=你的随机密钥           # 增强定时任务安全性
```

> 🔐 **安全提醒**：在 Supabase 控制台轮换旧的服务角色密钥（Settings → API → Service Role）后，务必将新的 `SUPABASE_SERVICE_ROLE_KEY`、`NEXT_PUBLIC_SUPABASE_URL` 等环境变量同步更新到 Vercel 或其他部署平台，并触发一次重新部署，确保代码始终使用最新凭据。

### 2. 数据库初始化
- 在Supabase SQL编辑器中执行 `newsbot-schema.sql`
- 系统会自动创建所需的表和策略
- 无需手动管理，系统自动维护

### 3. 部署命令
```bash
# 部署到Vercel
vercel --prod

# 或使用GitHub集成自动部署
git push origin main
```

## 📊 监控与管理

### 自动运行状态
- **定时任务**: 每天8次 (每3小时)
- **执行时间**: 约2-5分钟
- **失败重试**: 自动错误恢复
- **日志记录**: 完整的执行日志

### 手动触发 (可选)
```bash
# 立即执行一次
curl https://你的域名.vercel.app/api/newsbot

# 查看状态
curl https://你的域名.vercel.app/api/newsbot?action=status
```

### 数据库维护
✅ **完全自动化** - 系统自动处理：
- 重复内容过滤
- 旧数据清理
- 索引优化
- 错误日志轮换

## 🎯 部署后预期效果

### 即时生效
- 部署完成后立即开始工作
- 首次运行可能需要3-5分钟
- 每3小时自动发布新闻

### 内容质量
- 仅发布高质量英美主流媒体新闻
- AI智能翻译，保持原文语义
- 自动过滤低质量和重复内容
- 论坛格式化，易于阅读

### 用户体验
- 新闻内容丰富多样
- 更新及时，时效性强
- 中文翻译自然流畅
- 与现有论坛完美集成

## 🔧 故障排除

### 常见问题
1. **Python执行失败**: 确保环境变量 `PYTHON_PATH` 正确
2. **API配额用尽**: 检查OpenAI或DeepSeek余额
3. **数据库连接**: 验证Supabase配置
4. **权限问题**: 确保机器人账号存在

### 日志查看
- Vercel Functions页面查看执行日志
- Supabase Dashboard监控数据库活动
- 系统会自动记录所有操作

## 🎉 部署成功！

**恭喜！** 你的自动新闻机器人现在已经：
- ✅ 每3小时自动抓取英美新闻
- ✅ 智能翻译为中文内容
- ✅ 自动发布到论坛
- ✅ 完全自主运行，无需维护

**接下来只需要坐等新闻自动更新！** 🚀