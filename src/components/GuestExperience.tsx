"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type GuestPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const STORAGE_KEY = "guest-posts";

type GuestFeedback = { type: "success" | "error"; text: string };

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function GuestExperience() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<GuestPost[]>([]);
  const [feedback, setFeedback] = useState<GuestFeedback | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as GuestPost[];
      setPosts(parsed);
    } catch (error) {
      console.warn("Failed to parse guest posts", error);
    }
  }, []);

  const persist = useCallback((nextPosts: GuestPost[]) => {
    setPosts(nextPosts);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPosts));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setFeedback({ type: "error", text: "请填写完整的标题和内容" });
      return;
    }

    const nextPost: GuestPost = {
      id: createId(),
      title: trimmedTitle,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };

    const nextPosts = [nextPost, ...posts];
    persist(nextPosts);
    setTitle("");
    setContent("");
    setFeedback({ type: "success", text: "已保存到本地，登录后即可正式发布到社区" });
  };

  const handleRemove = (id: string) => {
    const nextPosts = posts.filter((post) => post.id !== id);
    persist(nextPosts);
  };

  const stats = useMemo(() => {
    if (!posts.length) return { total: 0, latest: "-" };
    const latest = posts[0];
    return {
      total: posts.length,
      latest: new Date(latest.createdAt).toLocaleString(),
    };
  }, [posts]);

  return (
    <div className="guest-layout">
      <aside className="guest-profile-card">
        <h2>游客个人页</h2>
        <p className="login-tip">
          游客模式同样可以浏览热门内容、收藏灵感，并提前撰写帖子草稿。完成注册后即可一键发布。
        </p>
        <dl>
          <div>
            <dt>草稿数量</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>最近保存</dt>
            <dd>{stats.latest}</dd>
          </div>
        </dl>
        <ul className="guest-perks">
          <li>随时保存灵感草稿，不怕丢失</li>
          <li>浏览论坛精选板块</li>
          <li>注册后自动同步草稿提醒</li>
        </ul>
      </aside>

      <section className="guest-post-card">
        <h3>游客发帖体验</h3>
        <p className="login-tip">
          先把想说的话记录下来吧，内容会安全保存在你的浏览器中。
        </p>
        {feedback && <div className={`message ${feedback.type}`}>{feedback.text}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>帖子标题</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：我对 AI 与社会的看法"
              required
              maxLength={80}
            />
          </label>
          <label>
            <span>正文内容</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录灵感、提问或分享故事..."
              required
              rows={6}
            />
          </label>
          <button type="submit" className="primary">
            保存草稿
          </button>
        </form>

        <div className="guest-drafts">
          <h4>本地草稿</h4>
          {!posts.length && <p className="login-tip">暂无草稿，先写一篇试试吧！</p>}
          {posts.length > 0 && (
            <ul className="guest-post-list">
              {posts.map((post) => (
                <li key={post.id}>
                  <div className="guest-post-head">
                    <strong>{post.title}</strong>
                    <time>{new Date(post.createdAt).toLocaleString()}</time>
                  </div>
                  <p>{post.content}</p>
                  <div className="guest-post-actions">
                    <button type="button" className="link-button" onClick={() => handleRemove(post.id)}>
                      删除草稿
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

