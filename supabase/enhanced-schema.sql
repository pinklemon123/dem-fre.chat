-- 改进版数据库架构 - 支持图片发帖功能
-- 在 Supabase SQL Editor 中执行

-- ================================
-- 1. 删除并重建 posts 表（添加图片支持）
-- ================================
DROP TABLE IF EXISTS public.posts CASCADE;

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  content text NOT NULL CHECK (length(trim(content)) > 0),
  image_url text, -- 新增：帖子图片 URL
  image_alt text, -- 新增：图片描述
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ================================
-- 2. 确保 profiles 表正确设置
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================
-- 3. 创建存储桶（用于图片上传）
-- ================================
-- 创建公共图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts-images',
  'posts-images',
  true,
  5242880, -- 5MB 限制
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ================================
-- 4. 创建 posts 表的 RLS 策略
-- ================================
-- 删除现有策略
DROP POLICY IF EXISTS posts_select_all ON public.posts;
DROP POLICY IF EXISTS posts_insert_own ON public.posts;
DROP POLICY IF EXISTS posts_update_own ON public.posts;
DROP POLICY IF EXISTS posts_delete_own ON public.posts;

-- 重新创建策略
CREATE POLICY posts_select_all ON public.posts FOR SELECT USING (true);
CREATE POLICY posts_insert_own ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY posts_update_own ON public.posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY posts_delete_own ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- 5. 创建 profiles 表的 RLS 策略
-- ================================
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================================
-- 6. 存储桶的 RLS 策略
-- ================================
-- 允许所有人查看图片
CREATE POLICY "posts_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'posts-images');

-- 只允许认证用户上传图片
CREATE POLICY "posts_images_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 只允许用户删除自己的图片
CREATE POLICY "posts_images_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================
-- 7. 插入测试数据（包含图片示例）
-- ================================
INSERT INTO public.posts (
  user_id, 
  title, 
  content, 
  image_url,
  image_alt,
  created_at
) 
SELECT 
  u.id,
  t.title,
  t.content,
  t.image_url,
  t.image_alt,
  t.created_at
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('欢迎来到民主复兴论坛！', '这是第一个测试帖子。论坛功能正常运行中！我们致力于促进民主讨论和思想交流。', null, null, now() - interval '2 hours'),
    ('如何使用这个论坛？', '1. 注册账号' || chr(10) || '2. 登录' || chr(10) || '3. 发布帖子' || chr(10) || '4. 浏览交流' || chr(10) || '5. 上传图片丰富内容', null, null, now() - interval '1 hour'),
    ('技术栈说明', 'Next.js + Supabase + TypeScript + Tailwind CSS' || chr(10) || '支持图片上传和实时更新功能', null, null, now() - interval '30 minutes')
) AS t(title, content, image_url, image_alt, created_at)
LIMIT 3;

-- ================================
-- 8. 创建更新时间触发器
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();