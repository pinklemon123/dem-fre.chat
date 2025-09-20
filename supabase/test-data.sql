-- 系统测试帖子脚本
-- 在 Supabase SQL Editor 中执行这个脚本

-- 首先创建一个系统用户（如果不存在的话）
-- 注意：这个 UUID 是固定的，用于系统测试
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'system@test.com',
  '$2a$10$fakehashedpassword',
  now(),
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 创建系统用户的 profile
INSERT INTO public.profiles (
  user_id,
  username,
  bio
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '系统测试',
  '这是系统自动创建的测试账号'
) ON CONFLICT (user_id) DO NOTHING;

-- 插入测试帖子
INSERT INTO public.posts (
  user_id,
  title,
  content,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '欢迎来到论坛！',
  '这是第一个测试帖子。论坛已经正常运行，大家可以开始发帖交流了！\n\n功能特点：\n- 用户注册和登录\n- 发布帖子\n- 浏览帖子\n- 响应式设计',
  now() - interval '2 hours'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '如何使用这个论坛？',
  '使用步骤：\n1. 点击右上角注册账号\n2. 验证邮箱后登录\n3. 在首页快速发布区域写帖子\n4. 浏览其他用户的帖子\n\n有问题可以在这里留言！',
  now() - interval '1 hour'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '技术栈介绍',
  '本论坛使用的技术栈：\n- Frontend: Next.js 15 + React 19 + TypeScript\n- Backend: Supabase (PostgreSQL + Auth)\n- Styling: Tailwind CSS\n- Deployment: Vercel\n\n代码开源，欢迎贡献！',
  now() - interval '30 minutes'
);