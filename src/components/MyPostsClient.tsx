"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

type Post = { id: string; title: string; content: string; created_at: string };

export default function MyPostsClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setEmail(data.user.email ?? null);
      const { data: rows } = await supabase
        .from("posts")
        .select("id,title,content,created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      setPosts((rows as Post[]) ?? []);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <p className="login-tip">加载中...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "1rem auto", padding: "0 1rem" }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">我的账号</div>
        <div className="card-content">{email ?? "-"}</div>
        <div className="card-meta">
          <Link href="/posts/new" className="primary">去发帖</Link>
        </div>
      </div>

      <h2>我发布的帖子</h2>
      <div className="card-list">
        {posts.length === 0 && <p className="login-tip">还没有发布任何帖子。</p>}
        {posts.map((p) => (
          <div className="card" key={p.id}>
            <div className="card-title">{p.title}</div>
            <div className="card-meta">{new Date(p.created_at).toLocaleString()}</div>
            <div className="card-content">{p.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

