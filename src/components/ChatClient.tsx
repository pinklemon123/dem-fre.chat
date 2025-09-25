"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_ai?: boolean;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'deepseek'>('deepseek');
  const bottomRef = useRef<HTMLDivElement | null>(null);
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
      setClientError("Supabase 未配置，聊天室功能暂不可用");
      return;
    }

    // Only load chat messages when not in AI mode
    if (isAiMode) {
      setMessages([]); // Clear messages when switching to AI mode
      return;
    }

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
  }, [supabase, isAiMode]);

  // Auto-scroll effect for both chat and AI messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (isAiMode) {
      await sendToAI();
    } else {
      await sendToChat();
    }
  };

  const sendToChat = async () => {
    if (!supabase) {
      alert("环境未完成配置，暂时无法发送消息");
      return;
    }
    
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

  const sendToAI = async () => {
    const userMessage = content.trim();
    setContent("");
    setIsAiLoading(true);

    // Add user message to local state
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      user_id: email || "用户",
      content: userMessage,
      created_at: new Date().toISOString(),
      is_ai: false
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          provider: aiProvider
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          user_id: "AI助手",
          content: data.response,
          created_at: new Date().toISOString(),
          is_ai: true
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          user_id: "系统",
          content: data.error || "AI 服务暂时不可用，请稍后再试",
          created_at: new Date().toISOString(),
          is_ai: true
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        user_id: "系统",
        content: "AI 服务暂时不可用，请稍后再试",
        created_at: new Date().toISOString(),
        is_ai: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "1rem auto", padding: "0 1rem" }}>
      {/* Mode Toggle */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setIsAiMode(false)}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #b3c6e6",
            borderRadius: 4,
            backgroundColor: !isAiMode ? "#4a90e2" : "white",
            color: !isAiMode ? "white" : "#4a90e2",
            cursor: "pointer"
          }}
        >
          💬 用户聊天
        </button>
        <button
          onClick={() => setIsAiMode(true)}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #b3c6e6",
            borderRadius: 4,
            backgroundColor: isAiMode ? "#4a90e2" : "white",
            color: isAiMode ? "white" : "#4a90e2",
            cursor: "pointer"
          }}
        >
          🤖 AI 对话
        </button>
        
        {isAiMode && (
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value as 'openai' | 'deepseek')}
            style={{
              padding: "0.5rem",
              border: "1px solid #b3c6e6",
              borderRadius: 4,
              marginLeft: "1rem"
            }}
          >
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI</option>
          </select>
        )}
      </div>

      <div className="card" style={{ maxHeight: 420, overflow: "auto" }}>
        {clientError && !isAiMode && <div className="card-content message error">{clientError}</div>}
        {isAiMode && messages.length === 0 && (
          <div className="card-content" style={{ textAlign: "center", color: "#666" }}>
            🤖 你好！我是AI助手，有什么可以帮助你的吗？
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="card-content" style={{ 
            marginBottom: 8,
            backgroundColor: m.is_ai ? "#f0f8ff" : "transparent",
            borderLeft: m.is_ai ? "3px solid #4a90e2" : "none",
            paddingLeft: m.is_ai ? "12px" : "8px"
          }}>
            <b>{isAiMode && m.is_ai ? "🤖 " : ""}{m.user_id.slice(0, 8)}</b>: {m.content}
            <div className="card-meta">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        {isAiLoading && (
          <div className="card-content" style={{ 
            marginBottom: 8,
            backgroundColor: "#f0f8ff",
            borderLeft: "3px solid #4a90e2",
            paddingLeft: "12px",
            fontStyle: "italic"
          }}>
            <b>🤖 AI助手</b>: 正在思考中...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isAiMode 
              ? "向AI助手提问..." 
              : (email ? "输入消息..." : "登录后才能发言")
          }
          disabled={isAiLoading || (!isAiMode && !email)}
          style={{ 
            flex: 1, 
            padding: ".6rem", 
            border: "1px solid #b3c6e6", 
            borderRadius: 4,
            opacity: isAiLoading ? 0.7 : 1
          }}
        />
        <button 
          type="submit" 
          className="login-btn"
          disabled={isAiLoading || (!isAiMode && !email)}
        >
          {isAiLoading ? "发送中..." : "发送"}
        </button>
      </form>
    </div>
  );
}

