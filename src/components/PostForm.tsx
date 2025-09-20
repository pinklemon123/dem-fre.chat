"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return getBrowserSupabaseClient();
    } catch (error) {
      console.error("Supabase client unavailable", error);
      return null;
    }
  }, []);

  // 若未登录，引导到登录页
  useEffect(() => {
    if (!supabase) {
      setClientError("Supabase 未配置，暂时无法发帖");
      return;
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
  }, [router, supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage("环境未完成配置，无法发布帖子");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }
      const { error } = await supabase
        .from("posts")
        .insert({ user_id: uid, title: title.trim(), content: content.trim() });
      if (error) throw error;
      // 成功后跳转到“我的页面”
      router.replace("/me");
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("发布失败");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  if (clientError) {
    return (
      <div className="login-container" style={{ maxWidth: 600 }}>
        <h2>发布新帖子</h2>
        <p className="login-tip">{clientError}</p>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ maxWidth: 600 }}>
      <h2>发布新帖子</h2>
      <form className="auth-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: "100%", height: 160, padding: ".7rem", border: "1px solid #b3c6e6", borderRadius: 10 }}
        />
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "发布中..." : "发布"}
        </button>
      </form>
      {message && <p className="login-tip">{message}</p>}
    </div>
  );
}

