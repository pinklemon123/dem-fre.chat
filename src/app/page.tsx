import Link from "next/link";
import NavClient from "../components/NavClient";
import QuickPostComposer from "../components/QuickPostComposer";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import {
  formatPostAuthor,
  normalizePostRows,
  type Post,
  type PostRow,
} from "../lib/posts";
import { getServerSupabaseClient } from "../lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

export const revalidate = 0;

/*
维护者提示（不影响运行）：
Git 推送到 GitHub：
1) git init
2) git remote add origin git@github.com:pinklemon123/dem-fre.chat.git
3) git add .
4) git commit -m "chore: init"
5) git branch -M main
6) git push -u origin main

必备环境变量（本地 .env.local 与部署平台）：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY（仅服务端，切勿提交到仓库）

Supabase 数据表与 RLS（在 SQL Editor 执行）：
- create table public.profiles (... id uuid primary key references auth.users(id) ...);
- create table public.posts (... author_id uuid references public.profiles(id) ...);
- alter table public.profiles enable row level security;
- alter table public.posts enable row level security;
- 策略：profiles/posts 所有人可读；仅本人可写/改/删（基于 auth.uid()）。

配置完成后：页面会自动启用登录态导航与快速发帖器。
*/

// 新增：服务端环境变量检测（URL + 匿名或服务角色任一）
const hasServerSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type Item = { title: string; meta: string; content: string };

const factions: Item[] = [
  { title: "技术派", meta: "成员：200+", content: "专注技术交流与分享" },
  { title: "生活派", meta: "成员：300+", content: "关注生活、情感、成长" },
  { title: "AI 先锋", meta: "成员：500+", content: "AI 相关话题讨论" },
];

const ranking: Item[] = [
  { title: "小明", meta: "积分：1800", content: "本月发帖最多" },
  { title: "AI达人", meta: "积分：1700", content: "热帖贡献者" },
  { title: "管理员", meta: "积分：1600", content: "论坛维护" },
];

async function fetchLatestPosts(): Promise<{ posts: Post[]; error: string | null }> {
  // 新增：缺少服务端 Supabase 配置时，避免调用 getServerSupabaseClient
  if (!hasServerSupabase) {
    console.warn(
      "[supabase] 服务端环境变量缺失：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY（或 SUPABASE_SERVICE_ROLE_KEY）。已跳过数据库查询。"
    );
    return {
      posts: [],
      error: "服务端未配置 Supabase 环境变量，请先在 .env 配置后刷新页面。",
    };
  }

  try {
    const supabase = getServerSupabaseClient();

    const { data, error }: {
      data: PostRow[] | null;
      error: PostgrestError | null;
    } = await supabase
      // 优先尝试：带 profiles 的联表查询
      .from("posts")
      .select("id,title,content,created_at,profiles(username,avatar_url)")
      .order("created_at", { ascending: false })
      .limit(20);

    // 如果联表失败（常见为外键/关系未建立），自动降级为仅查询 posts 字段
    if (error) {
      const msg = (error as any)?.message ?? String(error);
      const isRelationMissing =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("relationship") ||
          msg.toLowerCase().includes("related") ||
          msg.toLowerCase().includes("profiles"));

      if (isRelationMissing) {
        console.warn(
          "[posts] 关系联查失败，已回退为仅查询 posts。请确认 posts.author_id -> profiles.id 外键与 RLS 策略是否已建立。原始错误：",
          error
        );
        const fallback = await supabase
          .from("posts")
          .select("id,title,content,created_at")
          .order("created_at", { ascending: false })
          .limit(20);


        if (fallback.error) throw fallback.error;
        const posts = normalizePostRows(fallback.data as PostRow[] | null);
        return { posts, error: null };
      }

      // 其他错误类型：正常抛出并由外层处理
      throw error;
    }

    const posts = normalizePostRows(data as PostRow[] | null);
    return { posts, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "加载帖子失败";
    console.error("Failed to load posts", error);
    return { posts: [], error: message };
  }
}

function InfoCard({ item }: { item: Item }) {
  return (
    <div className="info-card">
      <div className="info-title">{item.title}</div>
      <div className="info-meta">{item.meta}</div>
      <div className="info-content">{item.content}</div>
    </div>
  );
}

export default async function HomePage() {
  const { posts, error } = await fetchLatestPosts();

  // 新增：检测公有 Supabase 环境变量是否已配置，避免客户端组件初始化失败
  const hasPublicSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="home-shell">
      <header className="site-header">
        <div className="logo"><Link href="/">论坛Logo</Link></div>
        {
          hasPublicSupabase ? (
            <NavClient
              links={[
                { href: "#hot", label: "热帖" },
                { href: "#factions", label: "热门派别" },
                { href: "#ranking", label: "用户排行" },
                { href: "/guest", label: "游客体验" },
              ]}
              loginHref="/login"
            />
          ) : (
            // 降级：静态导航，避免 NavClient 内部访问未配置的 Supabase
            <nav className="nav-fallback">
              <ul>
                <li><Link href="#hot">热帖</Link></li>
                <li><Link href="#factions">热门派别</Link></li>
                <li><Link href="#ranking">用户排行</Link></li>
                <li><Link href="/guest">游客体验</Link></li>
                {/* 新增：补回登录入口 */}
                <li><Link href="/login">登录</Link></li>
              </ul>
            </nav>
          )
        }
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <h1>分享观点，连接志同道合的伙伴</h1>
          <p>
            登录后即可在社区中发布帖子、参与讨论，还能查看自己的发帖记录。试试新的快速发帖器，几秒钟就能把想法晒出来。
          </p>
          <div className="hero-links">
            <Link href="#hot" className="primary">浏览最新帖子</Link>
            <Link href="/posts/new" className="ghost">去到完整发帖页</Link>
          </div>
        </div>
        <div className="hero-preview" aria-hidden>
          <div className="preview-card" />
          <div className="preview-card" />
          <div className="preview-card" />
        </div>
      </section>

      <div className="home-grid">
        <section className="post-feed" id="hot">
          <div className="section-head">
            <h2>🔥 最新帖子</h2>
            <span>实时同步社区讨论</span>
          </div>

          {
            hasPublicSupabase ? (
              <QuickPostComposer />
            ) : (
              // 降级：发帖器不可用时的提示，不触发客户端 Supabase 初始化
              <p className="feed-empty">
                发帖功能未启用：请配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。
              </p>
            )
          }

          {error ? (
            <p className="feed-empty">{error}</p>
          ) : posts.length === 0 ? (
            <p className="feed-empty">暂时还没有帖子，成为第一个发帖的人吧！</p>
          ) : (
            <div className="feed-list">
              {posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <header>
                    <h3>{post.title}</h3>
                    <span>{formatPostAuthor(post)}</span>
                  </header>
                  <p>{post.content}</p>
                  <footer>
                    <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
                    <Link href={`/posts/${post.id}`} className="ghost" prefetch={false}>
                      查看详情
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="home-aside">
          <section id="factions">
            <div className="section-head">
              <h2>热门派别</h2>
            </div>
            <div className="info-list">
              {factions.map((item) => (
                <InfoCard key={item.title} item={item} />
              ))}
            </div>
          </section>
          <section id="ranking">
            <div className="section-head">
              <h2>用户排行</h2>
            </div>
            <div className="info-list">
              {ranking.map((item) => (
                <InfoCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer>
        <p>© 2025 论坛网站</p>
      </footer>
    </main>
  );
}
