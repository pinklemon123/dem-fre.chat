"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // 邮箱或用户名
  const [email, setEmail] = useState(""); // 注册用邮箱
  const [username, setUsername] = useState(""); // 注册用用户名
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

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
        router.replace("/");
        setMessage("登录成功");
      } else {
        // 注册：收集邮箱 + 用户名 + 密码
        if (!username.trim()) throw new Error("请填写用户名");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // 在 profiles 表中插入用户名
        if (data.user?.id) {
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: data.user.id,
            username,
            email,
          });
          if (profileError) throw profileError;
        }

        setMessage("注册成功，请检查邮箱确认！");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>{mode === "signin" ? "登录" : "注册"}</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={onSubmit}>
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
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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