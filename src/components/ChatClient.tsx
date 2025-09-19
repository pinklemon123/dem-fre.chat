"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase/client";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setEmail(auth.user?.email ?? null);
      const { data } = await supabase
        .from("messages")
        .select("id,user_id,content,created_at")
        .order("created_at", { ascending: true })
        .limit(50);
      setMessages((data as Message[]) ?? []);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    load();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      alert("请先登录");
      return;
    }
    const { error } = await supabase
      .from("messages")
      .insert({ user_id: uid, content: content.trim() });
    if (!error) setContent("");
  };

  return (
    <div style={{ maxWidth: 900, margin: "1rem auto", padding: "0 1rem" }}>
      <div className="card" style={{ maxHeight: 420, overflow: "auto" }}>
        {messages.map((m) => (
          <div key={m.id} className="card-content" style={{ marginBottom: 8 }}>
            <b>{m.user_id.slice(0, 8)}</b>: {m.content}
            <div className="card-meta">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={email ? "输入消息..." : "登录后才能发言"}
          style={{ flex: 1, padding: ".6rem", border: "1px solid #b3c6e6", borderRadius: 4 }}
        />
        <button type="submit" className="login-btn">发送</button>
      </form>
    </div>
  );
}

