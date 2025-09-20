# Vercel 环境变量设置指南

## 需要在 Vercel 项目设置中添加的环境变量：

### 1. NEXT_PUBLIC_SUPABASE_URL
值：你的 Supabase 项目 URL
格式：https://your-project-id.supabase.co

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY  
值：你的 Supabase 匿名公钥
格式：eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

### 3. SUPABASE_SERVICE_ROLE_KEY
值：你的 Supabase 服务角色密钥（仅服务端使用）
格式：eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

## 如何获取这些值：

1. 登录 Supabase Dashboard
2. 选择你的项目  
3. 进入 Settings > API
4. 复制相应的密钥

## 设置步骤：

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 进入 Settings > Environment Variables
4. 添加上述三个变量
5. 重新部署项目