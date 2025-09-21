// 新闻机器人配置文件
export const NEWS_BOT_CONFIG = {
  // 基本设置
  name: 'NewsBot',
  version: '1.0.0',
  description: '智能新闻聚合机器人',

  // 新闻源配置 - 英美主流媒体
  news_sources: [
    {
      id: 'bbc',
      name: 'BBC News',
      url: 'https://www.bbc.com/news',
      rss_url: 'http://feeds.bbci.co.uk/news/rss.xml',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'UK'
    },
    {
      id: 'cnn',
      name: 'CNN',
      url: 'https://www.cnn.com',
      rss_url: 'http://rss.cnn.com/rss/edition.rss',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'US'
    },
    {
      id: 'reuters',
      name: 'Reuters',
      url: 'https://www.reuters.com',
      rss_url: 'https://www.reuters.com/tools/rss',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'UK'
    },
    {
      id: 'ap_news',
      name: 'Associated Press',
      url: 'https://apnews.com',
      rss_url: 'https://apnews.com/index.rss',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'US'
    },
    {
      id: 'guardian',
      name: 'The Guardian',
      url: 'https://www.theguardian.com',
      rss_url: 'https://www.theguardian.com/world/rss',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'UK'
    },
    {
      id: 'npr',
      name: 'NPR News',
      url: 'https://www.npr.org/news',
      rss_url: 'https://feeds.npr.org/1001/rss.xml',
      enabled: true,
      category: 'general',
      language: 'en',
      country: 'US'
    }
  ],

  // 爬取设置
  crawl_settings: {
    interval_hours: 3,           // 爬取间隔(小时) - 每3小时执行一次
    max_articles_per_run: 8,     // 每次最大文章数 - 每次爬取5-8篇高质量新闻
    timeout_seconds: 45,         // 请求超时(秒) - 给国外网站更多时间
    retry_attempts: 3,           // 重试次数
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    use_rss: true,              // 优先使用RSS源，更稳定
    auto_translate: true,        // 自动翻译英文新闻为中文
    quality_filter: true,       // 启用质量过滤
    min_content_length: 200     // 最小内容长度
  },

  // AI分析设置
  ai_settings: {
    summarization_enabled: true,  // 启用摘要生成
    sentiment_analysis: true,     // 启用情感分析
    duplicate_detection: true,    // 启用重复检测
    quality_threshold: 0.75,      // 质量阈值 - 提高到75%确保高质量
    max_summary_length: 150,      // 最大摘要长度
    translation_enabled: true,    // 启用自动翻译
    target_language: 'zh-CN',     // 目标语言：简体中文
    preserve_key_terms: true,     // 保留关键术语（人名、地名等）
    auto_categorize: true         // 自动分类新闻
  },

  // 发布设置
  posting_settings: {
    auto_post: true,              // 自动发布
    review_required: false,       // 需要审核
    post_format: 'markdown',      // 发布格式
    include_source: true,         // 包含来源
    add_tags: true               // 添加标签
  },

  // 调度设置
  schedule_settings: {
    crawl_cron: '0 */3 * * *',      // 爬取定时: 每3小时执行一次
    analysis_cron: '0 */6 * * *',   // 分析定时: 每6小时
    cleanup_cron: '0 3 * * *',      // 清理定时: 每天凌晨3点
    timezone: 'Asia/Shanghai',       // 时区
    auto_start: true,               // 系统启动时自动开始
    max_concurrent_crawls: 2        // 最大并发爬取数
  },

  // 存储设置
  storage_settings: {
    keep_days: 30,                // 数据保留天数
    max_storage_mb: 500,          // 最大存储(MB)
    compression_enabled: true,     // 启用压缩
    backup_enabled: true          // 启用备份
  },

  // 通知设置
  notification_settings: {
    email_alerts: false,          // 邮件通知
    error_notifications: true,    // 错误通知
    success_reports: false,       // 成功报告
    daily_summary: true          // 日报
  },

  // API设置
  api_settings: {
    openai_api_key: process.env.OPENAI_API_KEY || '',
    deepseek_api_key: process.env.DEEPSEEK_API_KEY || '',
    model_preference: 'deepseek',  // 'openai' 或 'deepseek'
    max_tokens: 1000,
    temperature: 0.7
  },

  // 数据库设置
  database_settings: {
    table_prefix: 'newsbot_',
    use_transactions: true,
    connection_pool_size: 10,
    query_timeout: 5000
  }
};

// 环境变量配置
export const ENV_CONFIG = {
  development: {
    debug: true,
    log_level: 'debug',
    mock_data: true
  },
  production: {
    debug: false,
    log_level: 'info',
    mock_data: false
  }
};

// 获取当前环境配置
export function getCurrentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return {
    ...NEWS_BOT_CONFIG,
    ...ENV_CONFIG[env as keyof typeof ENV_CONFIG]
  };
}

// 验证配置
export function validateConfig(config: typeof NEWS_BOT_CONFIG) {
  const errors: string[] = [];

  // 检查必需的API密钥
  if (!config.api_settings.openai_api_key && !config.api_settings.deepseek_api_key) {
    errors.push('至少需要配置一个AI API密钥');
  }

  // 检查新闻源
  if (config.news_sources.length === 0) {
    errors.push('至少需要配置一个新闻源');
  }

  // 检查爬取间隔
  if (config.crawl_settings.interval_hours < 1) {
    errors.push('爬取间隔不能少于1小时');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 更新配置
export function updateConfig(updates: Partial<typeof NEWS_BOT_CONFIG>) {
  return {
    ...NEWS_BOT_CONFIG,
    ...updates
  };
}