-- 新闻机器人数据库扩展
-- 在现有 schema.sql 基础上添加新闻机器人相关表

-- 扩展 posts 表以支持新闻机器人
alter table public.posts 
add column if not exists image_url text,
add column if not exists image_alt text,
add column if not exists source text,
add column if not exists original_url text,
add column if not exists category text default '一般',
add column if not exists is_bot_post boolean default false;

-- 新闻机器人专用表：新闻抓取历史
create table if not exists public.news_crawl_history (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null,
  articles_found integer not null default 0,
  articles_processed integer not null default 0,
  articles_posted integer not null default 0,
  success boolean not null default true,
  error_message text,
  processing_time_seconds numeric,
  created_at timestamp with time zone not null default now()
);

-- 新闻机器人专用表：文章去重哈希
create table if not exists public.news_content_hashes (
  id uuid primary key default gen_random_uuid(),
  content_hash text not null unique,
  title text not null,
  source text not null,
  created_at timestamp with time zone not null default now()
);

-- 新闻机器人专用表：任务调度日志
create table if not exists public.news_task_logs (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  task_type text not null, -- 'crawl', 'analyze', 'cleanup'
  status text not null, -- 'running', 'completed', 'failed'
  result_data jsonb,
  error_message text,
  started_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone
);

-- 新闻机器人配置表
create table if not exists public.news_bot_config (
  id uuid primary key default gen_random_uuid(),
  config_key text not null unique,
  config_value jsonb not null,
  description text,
  updated_at timestamp with time zone not null default now()
);

-- 创建索引优化查询性能
create index if not exists idx_posts_is_bot_post on public.posts(is_bot_post);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_news_content_hashes_hash on public.news_content_hashes(content_hash);
create index if not exists idx_news_crawl_history_created_at on public.news_crawl_history(created_at desc);
create index if not exists idx_news_task_logs_task_type on public.news_task_logs(task_type);
create index if not exists idx_news_task_logs_created_at on public.news_task_logs(started_at desc);

-- RLS 策略
alter table public.news_crawl_history enable row level security;
alter table public.news_content_hashes enable row level security;
alter table public.news_task_logs enable row level security;
alter table public.news_bot_config enable row level security;

-- 读取策略：所有人可读取新闻机器人数据
create policy if not exists "news_crawl_history_select_all"
on public.news_crawl_history for select
using (true);

create policy if not exists "news_content_hashes_select_all"
on public.news_content_hashes for select
using (true);

create policy if not exists "news_task_logs_select_all"
on public.news_task_logs for select
using (true);

create policy if not exists "news_bot_config_select_all"
on public.news_bot_config for select
using (true);

-- 写入策略：只有服务端可以写入（通过 service role key）
-- 这些表主要由新闻机器人后端服务写入，不是用户直接操作

-- 创建新闻机器人专用用户（如果不存在）
-- 注意：这需要在 Supabase 控制台手动创建，或者通过 service role 执行

-- 初始化配置数据
insert into public.news_bot_config (config_key, config_value, description) values
('enabled', 'true', '新闻机器人是否启用'),
('crawl_interval_hours', '3', '爬取间隔（小时）'),
('max_articles_per_run', '8', '每次最多处理文章数'),
('quality_threshold', '0.75', '文章质量阈值'),
('auto_translate', 'true', '是否自动翻译'),
('sources', '["BBC", "CNN", "Reuters", "Guardian", "AP"]', '启用的新闻源')
on conflict (config_key) do nothing;

-- 创建清理旧数据的函数
create or replace function cleanup_old_news_data()
returns void as $$
begin
  -- 删除30天前的爬取历史
  delete from public.news_crawl_history 
  where created_at < now() - interval '30 days';
  
  -- 删除30天前的内容哈希
  delete from public.news_content_hashes 
  where created_at < now() - interval '30 days';
  
  -- 删除7天前的任务日志
  delete from public.news_task_logs 
  where started_at < now() - interval '7 days';
  
  -- 删除30天前的机器人帖子
  delete from public.posts 
  where is_bot_post = true 
  and created_at < now() - interval '30 days';
end;
$$ language plpgsql;