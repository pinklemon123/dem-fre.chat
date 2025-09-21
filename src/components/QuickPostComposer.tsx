"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

const MIN_CONTENT_LENGTH = 10;

type Feedback = { type: "success" | "error"; text: string } | null;

export default function QuickPostComposer() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return getBrowserSupabaseClient();
    } catch (error) {
      console.error("Supabase client unavailable", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setClientError("Supabase 未配置，无法发布帖子");
      setHydrated(true);
      return;
    }

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
  }, [supabase]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedFile(null);
    setImagePreview(null);
    setFeedback(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: "error", text: "请选择图片文件" });
      return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "图片大小不能超过5MB" });
      return;
    }

    setSelectedFile(file);
    
    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    if (!supabase) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('posts-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('posts-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setFeedback({ type: "error", text: "环境未完成配置，暂时无法发帖" });
      return;
    }
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
      
      let imageUrl = null;
      
      // 如果有选择图片，先上传图片
      if (selectedFile && user) {
        imageUrl = await uploadImage(selectedFile, user.id);
        if (!imageUrl) {
          throw new Error("图片上传失败，请重试");
        }
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: nextTitle,
        content: nextContent,
        image_url: imageUrl,
        image_alt: selectedFile ? selectedFile.name : null,
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

  if (clientError) {
    return (
      <div className="composer-card">
        <div className="composer-title">快速发布</div>
        <p className="composer-tip">{clientError}</p>
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
