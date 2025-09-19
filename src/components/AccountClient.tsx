"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function AccountClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    location.href = "/";
  };

  if (loading) return <p className="login-tip">加载中...</p>;
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

