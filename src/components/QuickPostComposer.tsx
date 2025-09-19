"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

const MIN_CONTENT_LENGTH = 10;

type Feedback = { type: "success" | "error"; text: string } | null;

export default function QuickPostComposer() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setHydrated(true);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || nextContent.length < MIN_CONTENT_LENGTH) {
      setFeedback({ type: "error", text: "请完善标题与至少 10 字的内容" });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: nextTitle,
        content: nextContent,
      });
      if (error) throw error;
      resetForm();
      setFeedback({ type: "success", text: "发布成功！" });
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "发布失败，请稍后再试";
      setFeedback({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="composer-card" aria-hidden>
        <div className="composer-title skeleton" />
        <div className="composer-body skeleton" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="composer-card">
        <div className="composer-title">登录后即可发帖</div>
        <p className="composer-tip">加入社区，与大家分享你的观点。</p>
        <div className="composer-actions">
          <Link href="/login" className="primary">立即登录</Link>
          <Link href="/guest" className="ghost">先去体验</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="composer-card" onSubmit={handleSubmit}>
      <div className="composer-title">快速发布</div>
      <div className="composer-fields">
        <input
          type="text"
          placeholder="给你的帖子取个标题"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={2}
        />
        <textarea
          placeholder="分享最近的观点、困惑或灵感..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          minLength={MIN_CONTENT_LENGTH}
        />
      </div>
      {feedback && <p className={`composer-feedback ${feedback.type}`}>{feedback.text}</p>}
      <div className="composer-actions">
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "发布中..." : "发布帖子"}
        </button>
        <button type="button" className="ghost" onClick={resetForm} disabled={loading}>
          清空
        </button>
      </div>
    </form>
  );
}
