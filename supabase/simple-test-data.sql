-- 简化版测试数据 - 直接插入帖子而不创建复杂的用户系统
-- 在 Supabase SQL Editor 中执行

-- 插入几个测试帖子（使用现有的已注册用户，或者系统用户）
-- 注意：这里使用的 user_id 必须是已经存在于 auth.users 表中的

-- 方法1：查看现有用户
-- SELECT id, email FROM auth.users LIMIT 5;

-- 方法2：如果没有用户，先创建一个测试用户（这个需要通过应用注册）
-- 或者使用以下脚本创建系统测试帖子

DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- 尝试获取第一个现有用户的 ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- 如果没有用户，创建一个测试用户
    IF test_user_id IS NULL THEN
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
            'test@example.com',
            '$2a$10$fakehashedpasswordfortest',
            now(),
            now(),
            now(),
            '',
            ''
        );
        test_user_id := '00000000-0000-0000-0000-000000000001'::uuid;
        
        -- 创建对应的 profile
        INSERT INTO public.profiles (user_id, username, bio) 
        VALUES (test_user_id, '系统测试员', '这是系统自动创建的测试账号');
    END IF;
    
    -- 插入测试帖子
    INSERT INTO public.posts (user_id, title, content, created_at) VALUES 
    (test_user_id, '欢迎来到论坛！', '这是第一个测试帖子。论坛功能正常运行中！', now() - interval '2 hours'),
    (test_user_id, '如何使用这个论坛？', '1. 注册账号\n2. 登录\n3. 发布帖子\n4. 浏览交流', now() - interval '1 hour'),
    (test_user_id, '技术栈说明', 'Next.js + Supabase + TypeScript + Tailwind CSS', now() - interval '30 minutes');
    
END $$;