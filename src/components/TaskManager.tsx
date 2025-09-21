"use client";

import { useState, useEffect } from 'react';

interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  status: 'idle' | 'running' | 'error';
  error_message?: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/scheduler');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, taskId })
      });

      if (response.ok) {
        await fetchTasks(); // 刷新任务列表
      }
    } catch (error) {
      console.error('任务操作失败:', error);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '从未执行';
    return new Date(timeString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#2196F3';
      case 'error': return '#f44336';
      default: return '#4CAF50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'error': return '错误';
      default: return '空闲';
    }
  };

  if (loading) {
    return <div className="task-manager-loading">加载任务列表...</div>;
  }

  return (
    <div className="task-manager">
      <h3>定时任务管理</h3>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-header">
              <div className="task-info">
                <h4>{task.name}</h4>
                <span className="task-cron">计划: {task.cron}</span>
              </div>
              <div className="task-status">
                <span 
                  className="status-indicator"
                  style={{ color: getStatusColor(task.status) }}
                >
                  {getStatusText(task.status)}
                </span>
              </div>
            </div>
            
            <div className="task-details">
              <div className="task-times">
                <span>上次执行: {formatTime(task.last_run)}</span>
                {task.next_run && (
                  <span>下次执行: {formatTime(task.next_run)}</span>
                )}
              </div>
              
              {task.error_message && (
                <div className="task-error">
                  错误: {task.error_message}
                </div>
              )}
            </div>

            <div className="task-actions">
              <button
                onClick={() => handleTaskAction(task.id, 'execute')}
                className="task-btn execute"
                disabled={task.status === 'running'}
              >
                立即执行
              </button>
              
              <button
                onClick={() => handleTaskAction(task.id, task.enabled ? 'disable' : 'enable')}
                className={`task-btn ${task.enabled ? 'disable' : 'enable'}`}
              >
                {task.enabled ? '禁用' : '启用'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}