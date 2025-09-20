"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

export default function AccountClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      setClientError("Supabase 未配置，无法加载账号信息");
      setLoading(false);
      return;
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    })();
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    location.href = "/";
  };

  if (loading) return <p className="login-tip">加载中...</p>;
  if (clientError) return <p className="login-tip">{clientError}</p>;
  if (!email) return <p className="login-tip">未登录</p>;

  return (
    <div className="login-container">
      <h2>我的账号</h2>
      <p className="login-tip">当前邮箱：{email}</p>
      <button onClick={signOut} className="primary">
        退出登录
      </button>
    </div>
  );
}

