"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("登录成功");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("注册成功，请查收验证邮件");
      }
    } catch (err: any) {
      setMessage(err?.message ?? "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "signin" ? "用户登录" : "注册账号"}</h2>
      <form id="login-form" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "处理中..." : mode === "signin" ? "登录" : "注册"}
        </button>
      </form>
      {message && <p className="login-tip">{message}</p>}
      <p className="login-tip">
        {mode === "signin" ? (
          <>
            尚未注册？
            <a href="#" onClick={() => setMode("signup")}>去注册</a>
          </>
        ) : (
          <>
            已有账号？
            <a href="#" onClick={() => setMode("signin")}>去登录</a>
          </>
        )}
      </p>
    </div>
  );
}

