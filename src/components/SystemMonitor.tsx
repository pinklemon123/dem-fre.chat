"use client";

import { useState, useEffect } from 'react';

interface SystemStatus {
  online: boolean;
  last_crawl: string;
  total_articles: number;
  success_rate: number;
  errors_24h: number;
  storage_used: number;
  uptime: string;
}

export default function SystemMonitor() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 每30秒更新
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      // 模拟状态数据，实际应该调用API
      const mockStatus: SystemStatus = {
        online: true,
        last_crawl: new Date(Date.now() - 3600000).toISOString(), // 1小时前
        total_articles: 1247,
        success_rate: 94.5,
        errors_24h: 2,
        storage_used: 156.7, // MB
        uptime: '2天 14小时 32分钟'
      };

      setStatus(mockStatus);
    } catch (error) {
      console.error('获取系统状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  const getStatusColor = (online: boolean) => {
    return online ? '#4CAF50' : '#f44336';
  };

  if (loading) {
    return <div className="system-monitor-loading">加载系统状态...</div>;
  }

  if (!status) {
    return <div className="system-monitor-error">无法获取系统状态</div>;
  }

  return (
    <div className="system-monitor">
      <h3>系统监控</h3>
      
      <div className="status-grid">
        <div className="status-item">
          <div className="status-label">系统状态</div>
          <div 
            className="status-value"
            style={{ color: getStatusColor(status.online) }}
          >
            <span className="status-dot" style={{ backgroundColor: getStatusColor(status.online) }}></span>
            {status.online ? '在线' : '离线'}
          </div>
        </div>

        <div className="status-item">
          <div className="status-label">运行时间</div>
          <div className="status-value">{status.uptime}</div>
        </div>

        <div className="status-item">
          <div className="status-label">最后爬取</div>
          <div className="status-value">{formatTime(status.last_crawl)}</div>
        </div>

        <div className="status-item">
          <div className="status-label">总文章数</div>
          <div className="status-value">{status.total_articles.toLocaleString()}</div>
        </div>

        <div className="status-item">
          <div className="status-label">成功率</div>
          <div className="status-value">{status.success_rate}%</div>
        </div>

        <div className="status-item">
          <div className="status-label">24小时错误</div>
          <div className="status-value" style={{ color: status.errors_24h > 5 ? '#f44336' : '#4CAF50' }}>
            {status.errors_24h}
          </div>
        </div>

        <div className="status-item">
          <div className="status-label">存储使用</div>
          <div className="status-value">{status.storage_used.toFixed(1)} MB</div>
        </div>

        <div className="status-item">
          <div className="status-label">系统健康</div>
          <div className="status-value">
            <div className="health-bar">
              <div 
                className="health-fill"
                style={{ 
                  width: `${status.success_rate}%`,
                  backgroundColor: status.success_rate > 90 ? '#4CAF50' : 
                                 status.success_rate > 70 ? '#ff9800' : '#f44336'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          className="monitor-btn"
          onClick={() => window.location.reload()}
        >
          刷新状态
        </button>
        <button 
          className="monitor-btn secondary"
          onClick={() => console.log('导出日志功能待实现')}
        >
          导出日志
        </button>
      </div>
    </div>
  );
}