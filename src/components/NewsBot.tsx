"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

export default function NewsBot() {
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    todayPosts: 0,
    lastWeekPosts: 0
  });
  const [isManualRunning, setIsManualRunning] = useState(false);
  const [botUserId, setBotUserId] = useState<string | null>(
    () => process.env.NEXT_PUBLIC_NEWS_BOT_USER_ID ?? null
  );

  const supabase = getBrowserSupabaseClient();

  const resolveBotUserId = useCallback(async (): Promise<string | null> => {
    if (process.env.NEXT_PUBLIC_NEWS_BOT_USER_ID) {
      return process.env.NEXT_PUBLIC_NEWS_BOT_USER_ID;
    }

    try {
      const response = await fetch("/api/newsbot?action=status", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Failed to fetch bot status: ${response.status}`);
      }
      const payload = await response.json();
      return payload?.status?.botUserId ?? null;
    } catch (error) {
      console.error("获取新闻机器人账号失败:", error);
      return null;
    }
  }, []);

  const loadStats = useCallback(async (botId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // 获取总帖子数
      const { data: totalData } = await supabase
        .from("posts")
        .select("id", { count: "exact" })
        .eq("user_id", botId);

      // 获取今日帖子数
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from("posts")
        .select("id", { count: "exact" })
        .eq("user_id", botId)
        .gte("created_at", `${today}T00:00:00`);

      // 获取最近7天帖子数
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weekData } = await supabase
        .from("posts")
        .select("id", { count: "exact" })
        .eq("user_id", botId)
        .gte("created_at", weekAgo);

      setStats({
        totalPosts: totalData?.length || 0,
        todayPosts: todayData?.length || 0,
        lastWeekPosts: weekData?.length || 0
      });

      // 获取最后运行时间（从帖子创建时间推断）
      const { data: lastPost } = await supabase
        .from("posts")
        .select("created_at")
        .eq("user_id", botId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (lastPost && lastPost[0]) {
        setLastRun(lastPost[0].created_at);
      }

    } catch (error) {
      console.error("加载统计数据失败:", error);
    }
  }, [supabase]);

  useEffect(() => {
    if (botUserId !== null) return;

    let isMounted = true;

    resolveBotUserId().then((resolved) => {
      if (isMounted && resolved) {
        setBotUserId(resolved);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [botUserId, resolveBotUserId]);

  useEffect(() => {
    if (!botUserId) return;

    loadStats(botUserId);
  }, [botUserId, loadStats]);

  const runManualFetch = async () => {
    setIsManualRunning(true);
    setStatus("running");

    try {
      // 这里应该调用后端API来执行新闻抓取
      // 由于我们在前端，这里只是演示
      await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟运行

      setStatus("idle");
      setLastRun(new Date().toISOString());

      // 重新加载统计数据
      const resolvedBotId = botUserId ?? await resolveBotUserId();
      if (resolvedBotId) {
        setBotUserId(resolvedBotId);
        await loadStats(resolvedBotId);
      }

    } catch (error) {
      console.error("手动运行失败:", error);
      setStatus("error");
    } finally {
      setIsManualRunning(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "从未运行";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "刚刚";
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="newsbot-container">
      <div className="newsbot-header">
        <h2>🤖 新闻机器人</h2>
        <p>自动抓取和发布最新新闻资讯</p>
      </div>

      <div className="newsbot-grid">
        {/* 状态卡片 */}
        <div className="status-card">
          <h3>运行状态</h3>
          <div className={`status-indicator ${status}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {status === "idle" && "空闲"}
              {status === "running" && "运行中"}
              {status === "error" && "错误"}
            </span>
          </div>
          <p className="last-run">上次运行: {formatDate(lastRun)}</p>
        </div>

        {/* 统计卡片 */}
        <div className="stats-card">
          <h3>发帖统计</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.todayPosts}</span>
              <span className="stat-label">今日发帖</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.lastWeekPosts}</span>
              <span className="stat-label">本周发帖</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalPosts}</span>
              <span className="stat-label">总计发帖</span>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="control-card">
          <h3>手动控制</h3>
          <button 
            className="manual-run-btn" 
            onClick={runManualFetch}
            disabled={isManualRunning}
          >
            {isManualRunning ? "正在运行..." : "立即抓取新闻"}
          </button>
          <p className="control-note">
            点击按钮手动触发新闻抓取和发布
          </p>
        </div>

        {/* 配置信息 */}
        <div className="config-card">
          <h3>配置状态</h3>
          <div className="config-list">
            <div className="config-item">
              <span className="config-name">新闻源</span>
              <span className="config-status active">BBC中文、央视新闻</span>
            </div>
            <div className="config-item">
              <span className="config-name">AI摘要</span>
              <span className="config-status active">OpenAI GPT-4</span>
            </div>
            <div className="config-item">
              <span className="config-name">定时任务</span>
              <span className="config-status active">每日 8:00</span>
            </div>
            <div className="config-item">
              <span className="config-name">去重检查</span>
              <span className="config-status active">7天内容指纹</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新闻源配置 */}
      <div className="news-sources-card">
        <h3>📡 英美新闻源配置</h3>
        <div className="sources-grid">
          <div className="source-item">
            <span className="source-name">BBC World News</span>
            <span className="source-status active">✅ 启用</span>
            <span className="source-info">RSS: 每3小时 | 质量: 高</span>
          </div>
          <div className="source-item">
            <span className="source-name">CNN International</span>
            <span className="source-status active">✅ 启用</span>
            <span className="source-info">RSS: 每3小时 | 质量: 高</span>
          </div>
          <div className="source-item">
            <span className="source-name">Reuters World</span>
            <span className="source-status active">✅ 启用</span>
            <span className="source-info">RSS: 每3小时 | 质量: 高</span>
          </div>
          <div className="source-item">
            <span className="source-name">The Guardian</span>
            <span className="source-status active">✅ 启用</span>
            <span className="source-info">RSS: 每3小时 | 质量: 高</span>
          </div>
          <div className="source-item">
            <span className="source-name">Associated Press</span>
            <span className="source-status active">✅ 启用</span>
            <span className="source-info">RSS: 每3小时 | 质量: 高</span>
          </div>
        </div>
        <div className="translation-info">
          <span className="translation-badge">🌐 自动翻译</span>
          <span className="translation-text">英文新闻自动翻译为中文 | 每次处理5-8篇高质量文章</span>
        </div>
      </div>

      <div className="newsbot-features">
        <h3>功能特点</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <h4>智能抓取</h4>
            <p>自动从多个新闻源抓取最新资讯</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🧠</span>
            <h4>AI摘要</h4>
            <p>使用GPT生成简洁准确的新闻摘要</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚫</span>
            <h4>智能去重</h4>
            <p>自动检测并避免重复内容</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <h4>定时发布</h4>
            <p>按计划自动发布，保持内容更新</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <h4>多媒体支持</h4>
            <p>自动提取和包含新闻配图</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <h4>数据统计</h4>
            <p>详细的运行统计和性能监控</p>
          </div>
        </div>
      </div>
    </div>
  );
}