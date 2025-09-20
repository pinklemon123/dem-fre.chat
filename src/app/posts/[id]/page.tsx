import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavClient from "../../../components/NavClient";
import { formatRelativeTime } from "../../../lib/formatRelativeTime";
import {
  formatPostAuthor,
  normalizePostRow,
  type Post,
  type PostRow,
} from "../../../lib/posts";
import { getServerSupabaseClient } from "../../../lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

export const revalidate = 0;

const hasServerSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 基础 UUID 校验（如你的 id 不是 UUID，可按需调整正则）
const isValidId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

type FetchPostResult = { post: Post | null; error: string | null };

async function fetchPost(id: string): Promise<FetchPostResult> {
  if (!hasServerSupabase) {
    return {
      post: null,
      error: "服务端未配置 Supabase 环境变量，请先在 .env 配置后刷新页面。",
    };
  }

  if (!isValidId(id)) {
    return {
      post: null,
      error: "帖子 ID 不是有效的 UUID，请确认链接是否正确。",
    };
  }

  try {
    const supabase = getServerSupabaseClient();
    const { data, error }: {
      data: PostRow | null;
      error: PostgrestError | null;
    } = await supabase
      .from("posts")
      .select("id,title,content,created_at,profiles(username,avatar_url)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return { post: normalizePostRow(data ?? null), error: null };
  } catch (error) {
    console.error("Failed to fetch post", error);
    const message = error instanceof Error ? error.message : "加载帖子失败";
    return { post: null, error: message };
  }
}

type RouteParams = { id: string };

export default async function PostDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const { post, error } = await fetchPost(id);

  if (error) {
    return (
      <main className="post-detail-shell">
        <header className="site-header">
          <div className="logo"><Link href="/">论坛Logo</Link></div>
          <NavClient
            links={[
              { href: "/#hot", label: "热帖" },
              { href: "/factions", label: "热门派别" },
              { href: "/ranking", label: "用户排行" },
              { href: "/guest", label: "游客体验" },
            ]}
            loginHref="/login"
          />
        </header>
        <article className="post-detail-card">
          <div className="post-detail-head">
            <h1>暂时无法加载帖子</h1>
            <div className="post-detail-meta">
              <span>请检查配置后重试</span>
            </div>
          </div>
          <div className="post-detail-content">
            <p>{error}</p>
          </div>
          <div className="post-detail-actions">
            <Link href="/" className="primary">
              返回首页
            </Link>
          </div>
        </article>
      </main>
    );
  }

  if (!post) {
    notFound();
    return null;
  }

  return (
    <main className="post-detail-shell">
      <header className="site-header">
        <div className="logo"><Link href="/">论坛Logo</Link></div>
        <NavClient
          links={[
            { href: "/#hot", label: "热帖" },
            { href: "/factions", label: "热门派别" },
            { href: "/ranking", label: "用户排行" },
            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>
      <article className="post-detail-card">
        <div className="post-detail-head">
          <h1>{post.title}</h1>
          <div className="post-detail-meta">
            <span>{formatPostAuthor(post)}</span>
            <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
          </div>
        </div>
        <div className="post-detail-content">{post.content}</div>
        <div className="post-detail-actions">
          <Link href="/" className="ghost">
            返回首页
          </Link>
          <Link href="/posts/new" className="primary">
            我也要发帖
          </Link>
        </div>
      </article>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;

  const { post, error } = await fetchPost(id);

  if (error || !post) {
    return { title: "帖子不存在 - 论坛社区" };
  }

  const author = formatPostAuthor(post);
  // 更干净的预览文本
  const clean = post.content.replace(/\s+/g, " ").trim();
  const preview = clean.length > 80 ? `${clean.slice(0, 80)}...` : clean;

  return {
    title: `${post.title} - 论坛社区`,
    description: `${author} · ${preview}`,
    // 社交分享的元数据
    openGraph: {
      title: `${post.title} - 论坛社区`,
      description: `${author} · ${preview}`,
    },
    twitter: {
      card: "summary",
      title: `${post.title} - 论坛社区`,
      description: `${author} · ${preview}`,
    },
  };
}

