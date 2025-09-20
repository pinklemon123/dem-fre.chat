"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

type Mode = "signin" | "signup";
type Feedback = { type: "success" | "error"; text: string };

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // 邮箱或用户名
  const [email, setEmail] = useState(""); // 注册用邮箱
  const [username, setUsername] = useState(""); // 注册用用户名
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const router = useRouter();
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
      setClientError("Supabase 未配置，无法完成登录操作");
    }
  }, [supabase]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setIdentifier("");
    setEmail("");
    setUsername("");
    setPassword("");
    setFeedback(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setFeedback({ type: "error", text: "环境未完成配置，无法登录或注册" });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      if (mode === "signin") {
        // 支持邮箱或用户名登录
        let emailToUse = identifier.trim();
        if (!emailToUse) throw new Error("请输入邮箱或用户名");
        if (!emailToUse.includes("@")) {
          const { data: prof, error: qErr } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", emailToUse)
            .maybeSingle();
          if (qErr) throw qErr;
          if (!prof?.email) throw new Error("未找到该用户名");
          emailToUse = prof.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        if (error) throw error;
        setFeedback({ type: "success", text: "登录成功，正在跳转..." });
        router.replace("/");
      } else {
        // 注册：收集邮箱 + 用户名 + 密码
        if (!username.trim()) throw new Error("请填写用户名");
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;

        // 在 profiles 表中插入用户名
        if (data.user?.id) {
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: data.user.id,
            username: username.trim(),
            email: email.trim(),
          });
          if (profileError) throw profileError;
        }

        setFeedback({ type: "success", text: "注册成功，请检查邮箱确认！" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      setFeedback({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" role="region" aria-labelledby="auth-title">
      <div className="auth-toggle" role="tablist" aria-label="登录或注册">
        <button
          type="button"
          className={mode === "signin" ? "active" : undefined}
          onClick={() => switchMode("signin")}
          aria-pressed={mode === "signin"}
        >
          登录
        </button>
        <button
          type="button"
          className={mode === "signup" ? "active" : undefined}
          onClick={() => switchMode("signup")}
          aria-pressed={mode === "signup"}
        >
          注册
        </button>
      </div>
      <h1 id="auth-title">{mode === "signin" ? "欢迎回来" : "注册新账号"}</h1>
      <p className="login-subtitle">
        {mode === "signin" ? "输入账号信息，即刻开启今日的讨论。" : "填写信息，加入热闹的论坛社区。"}
      </p>
      {clientError && <div className="message error">{clientError}</div>}
      {feedback && <div className={`message ${feedback.type}`}>{feedback.text}</div>}
      <form className="auth-form" onSubmit={onSubmit}>
        {mode === "signin" ? (
          <label>
            <span>邮箱或用户名</span>
            <input
              type="text"
              placeholder="your@email.com 或昵称"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
        ) : (
          <>
            <label>
              <span>邮箱</span>
              <input
                type="email"
                placeholder="用于接收验证邮件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label>
              <span>用户名</span>
              <input
                type="text"
                placeholder="社区中的展示名称"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="nickname"
              />
            </label>
          </>
        )}
        <label>
          <span>密码</span>
          <input
            type="password"
            placeholder="至少 6 位字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "处理中..." : mode === "signin" ? "登录" : "注册"}
        </button>
      </form>
      <div className="auth-footer">
        <p className="login-tip">
          {mode === "signin" ? "还没有账号？" : "已经有账号了？"}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="link-button"
          >
            {mode === "signin" ? "立即注册" : "去登录"}
          </button>
        </p>
        <p className="login-tip">
          还在犹豫？<Link href="/guest">先以游客身份体验社区</Link>
        </p>
      </div>
    </div>
  );
}
