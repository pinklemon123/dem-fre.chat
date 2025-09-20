-- 完全正确的数据库架构
-- 在 Supabase SQL Editor 中按顺序执行这些语句

-- ================================
-- 1. 创建 profiles 表
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================
-- 2. 创建 posts 表
-- ================================
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  content text NOT NULL CHECK (length(trim(content)) > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ================================
-- 3. 删除所有现有策略（清理）
-- ================================
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS posts_select_all ON public.posts;
DROP POLICY IF EXISTS posts_insert_own ON public.posts;
DROP POLICY IF EXISTS posts_update_own ON public.posts;
DROP POLICY IF EXISTS posts_delete_own ON public.posts;

-- ================================
-- 4. 创建 profiles 表的 RLS 策略
-- ================================
-- 任何人都可以查看用户资料
CREATE POLICY profiles_select_all ON public.profiles 
FOR SELECT USING (true);

-- 只有用户本人可以插入自己的资料
CREATE POLICY profiles_insert_own ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 只有用户本人可以更新自己的资料
CREATE POLICY profiles_update_own ON public.profiles 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================================
-- 5. 创建 posts 表的 RLS 策略
-- ================================
-- 任何人都可以查看帖子
CREATE POLICY posts_select_all ON public.posts 
FOR SELECT USING (true);

-- 只有认证用户可以插入帖子，且必须是自己的 user_id
CREATE POLICY posts_insert_own ON public.posts 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 只有帖子作者可以更新自己的帖子
CREATE POLICY posts_update_own ON public.posts 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 只有帖子作者可以删除自己的帖子
CREATE POLICY posts_delete_own ON public.posts 
FOR DELETE USING (auth.uid() = user_id);