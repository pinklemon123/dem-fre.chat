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

export const revalidate = 0;

// 基础 UUID 校验（如你的 id 不是 UUID，可按需调整正则）
const isValidId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,content,created_at,profiles(username,email)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return normalizePostRow((data as PostRow | null) ?? null);
  } catch (error) {
    console.error("Failed to fetch post", error);
    return null;
  }
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  // 无效 id 直接 404
  if (!isValidId(params.id)) {
    notFound();
    return null;
  }

  const post = await fetchPost(params.id);

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // 无效 id 元数据直接返回“帖子不存在”
  if (!isValidId(params.id)) {
    return { title: "帖子不存在 - 论坛社区" };
  }

  const post = await fetchPost(params.id);
  if (!post) {
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

