"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DiagnosticInfo {
  environment: {
    openai_key: string;
    deepseek_key: string;
    node_env: string;
    platform: string;
  };
  timestamp: string;
}

interface TestResult {
  provider: string;
  status: string;
  message: string;
  details?: any;
}

export default function DiagnosticPage() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiagnosticInfo();
  }, []);

  const loadDiagnosticInfo = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setDiagnosticInfo(data);
    } catch (err) {
      setError('Failed to load diagnostic information');
      console.error('Diagnostic error:', err);
    }
  };

  const testAPI = async (provider: 'openai' | 'deepseek') => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: '测试连接',
          provider
        })
      });

      const data = await response.json();
      
      const result: TestResult = {
        provider: provider.toUpperCase(),
        status: data.success ? 'SUCCESS' : 'FAILED',
        message: data.success ? '连接成功' : data.error,
        details: data
      };

      setTestResults(prev => [...prev.filter(r => r.provider !== provider.toUpperCase()), result]);
    } catch (err) {
      const result: TestResult = {
        provider: provider.toUpperCase(),
        status: 'ERROR',
        message: '网络连接失败',
        details: err
      };
      
      setTestResults(prev => [...prev.filter(r => r.provider !== provider.toUpperCase()), result]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1>🔧 API 配置诊断工具</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          检查 Railway 环境变量配置和 AI API 连接状态
        </p>
        <Link href="/chat" style={{ color: "#4a90e2", textDecoration: "underline" }}>
          ← 返回聊天页面
        </Link>
      </header>

      {/* Environment Information */}
      <section style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div className="card-content">
            <h2>📋 环境变量状态</h2>
            {error && (
              <div style={{ color: "red", marginBottom: "1rem" }}>
                错误: {error}
              </div>
            )}
            {diagnosticInfo ? (
              <div style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                <p><strong>OpenAI API Key:</strong> <span style={{ color: diagnosticInfo.environment.openai_key.includes("未配置") ? "red" : "green" }}>
                  {diagnosticInfo.environment.openai_key}
                </span></p>
                <p><strong>DeepSeek API Key:</strong> <span style={{ color: diagnosticInfo.environment.deepseek_key.includes("未配置") ? "red" : "green" }}>
                  {diagnosticInfo.environment.deepseek_key}
                </span></p>
                <p><strong>环境:</strong> {diagnosticInfo.environment.node_env}</p>
                <p><strong>平台:</strong> {diagnosticInfo.environment.platform}</p>
                <p><strong>检查时间:</strong> {new Date(diagnosticInfo.timestamp).toLocaleString()}</p>
              </div>
            ) : (
              <p>加载中...</p>
            )}
          </div>
        </div>
      </section>

      {/* API Testing */}
      <section style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div className="card-content">
            <h2>🧪 API 连接测试</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button 
                onClick={() => testAPI('openai')}
                disabled={isLoading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#4a90e2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? "测试中..." : "测试 OpenAI"}
              </button>
              <button 
                onClick={() => testAPI('deepseek')}
                disabled={isLoading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? "测试中..." : "测试 DeepSeek"}
              </button>
              <button 
                onClick={clearResults}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                清除结果
              </button>
            </div>

            {testResults.length > 0 && (
              <div>
                <h3>测试结果:</h3>
                {testResults.map((result, index) => (
                  <div 
                    key={`${result.provider}-${index}`}
                    style={{
                      padding: "1rem",
                      margin: "0.5rem 0",
                      borderRadius: "4px",
                      backgroundColor: result.status === 'SUCCESS' ? "#d4edda" : "#f8d7da",
                      border: `1px solid ${result.status === 'SUCCESS' ? "#c3e6cb" : "#f5c6cb"}`,
                      color: result.status === 'SUCCESS' ? "#155724" : "#721c24"
                    }}
                  >
                    <p><strong>{result.provider}</strong>: {result.status}</p>
                    <p>{result.message}</p>
                    {result.status === 'SUCCESS' && result.details?.response && (
                      <p style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
                        AI 响应: "{result.details.response.substring(0, 100)}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Troubleshooting Guide */}
      <section>
        <div className="card">
          <div className="card-content">
            <h2>🚨 常见问题解决方案</h2>
            
            <h3>1. API Key 未配置</h3>
            <p>如果显示"未配置"，请在 Railway 项目设置中添加环境变量：</p>
            <ul>
              <li><code>OPENAI_API_KEY</code> - 你的 OpenAI API 密钥</li>
              <li><code>DEEPSEEK_API_KEY</code> - 你的 DeepSeek API 密钥</li>
            </ul>

            <h3>2. API Key 无效</h3>
            <p>如果测试失败并显示"API 密钥无效"：</p>
            <ul>
              <li>检查密钥是否正确复制（没有多余空格）</li>
              <li>确认密钥未过期</li>
              <li>验证账户余额是否充足</li>
            </ul>

            <h3>3. 网络连接问题</h3>
            <p>如果显示"网络连接错误"：</p>
            <ul>
              <li>等待几分钟后重试</li>
              <li>检查 API 服务是否正常运行</li>
              <li>确认防火墙设置</li>
            </ul>

            <h3>4. Railway 部署注意事项</h3>
            <ul>
              <li>环境变量设置后需要重新部署</li>
              <li>确保密钥字符串没有被截断</li>
              <li>检查项目是否正确连接到 Railway 服务</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}