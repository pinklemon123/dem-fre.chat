# 🤖 AI对话功能使用指南

## 功能概述

本论坛现已集成AI对话功能，支持与智能助手进行实时对话。用户可以在`/chat`页面体验这一功能。

## 主要特性

### 🔧 双重AI支持
- **DeepSeek**: 高性价比的中文对话模型（推荐）
- **OpenAI GPT-4**: 业界领先的AI模型

### 💬 灵活切换模式
- **用户聊天**: 与其他论坛用户实时交流（需要登录和Supabase配置）
- **AI对话**: 与AI助手对话，无需登录即可使用

### 🎨 友好的用户界面
- AI消息有特殊的蓝色标识
- 实时显示AI思考状态
- 自动滚动到最新对话
- 支持选择AI提供商

## 使用方法

### 1. 访问对话页面
导航到 `/chat` 页面或点击导航栏中的"聊天对话"链接。

### 2. 选择对话模式
- 点击"🤖 AI 对话"按钮进入AI模式
- 选择AI提供商（DeepSeek或OpenAI）

### 3. 开始对话
在输入框中输入您的问题，点击"发送"即可与AI助手对话。

## 配置要求

### 环境变量配置
在`.env`文件中配置以下环境变量：

```bash
# DeepSeek配置（推荐）
DEEPSEEK_API_KEY=your_deepseek_api_key

# 或者OpenAI配置
OPENAI_API_KEY=your_openai_api_key
```

### API密钥获取
- **DeepSeek**: 访问 [DeepSeek官网](https://platform.deepseek.com/) 注册并获取API密钥
- **OpenAI**: 访问 [OpenAI Platform](https://platform.openai.com/) 注册并获取API密钥

## 错误处理

当AI服务不可用时，系统会显示友好的错误信息：
- "AI 服务暂时不可用，请稍后再试"
- 具体的错误原因（如API密钥未配置）

## API接口

### POST /api/chat

发送消息给AI助手。

**请求体：**
```json
{
  "message": "你好",
  "provider": "deepseek"
}
```

**成功响应：**
```json
{
  "success": true,
  "response": "你好！我是AI助手，有什么可以帮助你的吗？"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "AI 服务暂时不可用，请稍后再试"
}
```

## 开发说明

### 组件结构
- `src/components/ChatClient.tsx`: 主要的聊天组件
- `src/app/api/chat/route.ts`: AI对话API端点
- `src/app/chat/page.tsx`: 聊天页面

### 技术实现
- 使用React Hooks管理状态
- 支持实时消息显示
- 错误边界处理
- 自适应UI设计

## 故障排除

### 常见问题
1. **AI不响应**: 检查API密钥是否正确配置
2. **网络错误**: 确认网络连接正常
3. **超时问题**: API调用设置了30秒超时限制

### 日志调试
检查浏览器控制台和服务器日志获取详细错误信息。

## 更新日志

- **v1.0.0**: 基础AI对话功能
- 支持DeepSeek和OpenAI双重API
- 实现模式切换和错误处理
- 添加友好的用户界面