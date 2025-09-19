"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // 邮箱或用户名
  const [email, setEmail] = useState(""); // 注册用邮箱
  const [username, setUsername] = useState(""); // 注册用用户名
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
        // 支持邮箱或用户名登录
        let emailToUse = identifier;
        if (!identifier.includes("@")) {
          const { data: prof, error: qErr } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", identifier)
            .maybeSingle();
          if (qErr) throw qErr;
          if (!prof?.email) throw new Error("未找到该用户名");
          emailToUse = prof.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        if (error) throw error;
        setMessage("登录成功");
      } else {
        // 注册：收集邮箱 + 用户名 + 密码
        if (!username.trim()) throw new Error("请填写用户名");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // 如果开启了邮件验证，注册后可能没有 session，这里仅尝试写入，不保证一定成功
        const uid = data.user?.id;
        if (uid) {
          await supabase.from("profiles").upsert({ user_id: uid, username: username.trim(), email });
        }
        setMessage("注册成功，请查收验证邮件");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "signin" ? "用户登录" : "注册账号"}</h2>
      <form id="login-form" onSubmit={onSubmit}>
        {mode === "signin" ? (
          <input
            type="text"
            placeholder="邮箱或用户名"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="用户名（3 个字符以上）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

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
