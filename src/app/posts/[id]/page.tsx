import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavClient from "../../../components/NavClient";
import { formatRelativeTime } from "../../../lib/formatRelativeTime";
import { getServerSupabaseClient } from "../../../lib/supabase/server";

export const revalidate = 0;

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: { username: string | null; email: string | null } | null;
};

async function fetchPost(id: string): Promise<PostRow | null> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,content,created_at,profiles(username,email)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return (data as PostRow | null) ?? null;
  } catch (error) {
    console.error("Failed to fetch post", error);
    return null;
  }
}

function formatAuthor(post: PostRow) {
  const username = post.profiles?.username;
  const email = post.profiles?.email;
  if (username) return username;
  if (email) return email.split("@")[0];
  return "匿名用户";
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);

  if (!post) {
    notFound();
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
            <span>{formatAuthor(post)}</span>
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
  const post = await fetchPost(params.id);
  if (!post) {
    return { title: "帖子不存在 - 论坛社区" };
  }

  const author = formatAuthor(post);
  const preview = post.content.length > 80 ? `${post.content.slice(0, 80)}...` : post.content;

  return {
    title: `${post.title} - 论坛社区`,
    description: `${author} · ${preview}`,
  };
}
