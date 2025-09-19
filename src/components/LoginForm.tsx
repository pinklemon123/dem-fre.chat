"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // 閭鎴栫敤鎴峰悕
  const [email, setEmail] = useState(""); // 娉ㄥ唽鐢ㄩ偖绠?  const [username, setUsername] = useState(""); // 娉ㄥ唽鐢ㄧ敤鎴峰悕
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
        // 鏀寔閭鎴栫敤鎴峰悕鐧诲綍
        let emailToUse = identifier;
        if (!identifier.includes("@")) {
          const { data: prof, error: qErr } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", identifier)
            .maybeSingle();
          if (qErr) throw qErr;
          if (!prof?.email) throw new Error("鏈壘鍒拌鐢ㄦ埛鍚?);
          emailToUse = prof.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        if (error) throw error;
        router.replace("/");
        setMessage("鐧诲綍鎴愬姛");
      } else {
        // 娉ㄥ唽锛氭敹闆嗛偖绠?+ 鐢ㄦ埛鍚?+ 瀵嗙爜
        if (!username.trim()) throw new Error("璇峰～鍐欑敤鎴峰悕");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        router.replace("/");

        // 濡傛灉寮€鍚簡閭欢楠岃瘉锛屾敞鍐屽悗鍙兘娌℃湁 session锛岃繖閲屼粎灏濊瘯鍐欏叆锛屼笉淇濊瘉涓€瀹氭垚鍔?        const uid = data.user?.id;
        if (uid) {
          await supabase.from("profiles").upsert({ user_id: uid, username: username.trim(), email });
        }
        setMessage("娉ㄥ唽鎴愬姛锛岃鏌ユ敹楠岃瘉閭欢");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("鎿嶄綔澶辫触");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "signin" ? "鐢ㄦ埛鐧诲綍" : "娉ㄥ唽璐﹀彿"}</h2>
      <form id="login-form" onSubmit={onSubmit}>
        {mode === "signin" ? (
          <input
            type="text"
            placeholder="閭鎴栫敤鎴峰悕"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="鐢ㄦ埛鍚嶏紙3 涓瓧绗︿互涓婏級"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="閭"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="password"
          placeholder="瀵嗙爜"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "澶勭悊涓?.." : mode === "signin" ? "鐧诲綍" : "娉ㄥ唽"}
        </button>
      </form>
      {message && <p className="login-tip">{message}</p>}
      <p className="login-tip">
        {mode === "signin" ? (
          <>
            灏氭湭娉ㄥ唽锛?            <a href="#" onClick={() => setMode("signup")}>鍘绘敞鍐?/a>
          </>
        ) : (
          <>
            宸叉湁璐﹀彿锛?            <a href="#" onClick={() => setMode("signin")}>鍘荤櫥褰?/a>
          </>
        )}
      </p>
    </div>
  );
}



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  // 登录用：邮箱或用户名
  const [identifier, setIdentifier] = useState("");
  // 注册用：邮箱与用户名
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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

        const { error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        });
        if (error) throw error;
        // 登录成功后跳转主页
        router.replace("/");
        return;
      }

      // 注册：收集用户名 + 邮箱 + 密码
      if (!username.trim()) throw new Error("请填写用户名");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // 若开启邮箱验证，注册后通常无 session；仅尝试写入 profiles
      const uid = data.user?.id;
      if (uid) {
        await supabase
          .from("profiles")
          .upsert({ user_id: uid, username: username.trim(), email });
      }
      setMessage("注册成功，请查收验证邮件");
      setMode("signin");
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
