import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatRequest {
  message: string;
  provider?: 'openai' | 'deepseek';
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json();
    const { message, provider = 'deepseek' } = body;

    console.log(`[Chat API] Request received - Provider: ${provider}, Message length: ${message?.length || 0}`);

    if (!message?.trim()) {
      return NextResponse.json({
        success: false,
        error: "消息内容不能为空"
      }, { status: 400 });
    }

    // 选择API配置
    let apiKey: string | undefined;
    let endpoint: string;
    let model: string;

    if (provider === "deepseek") {
      apiKey = process.env.DEEPSEEK_API_KEY;
      endpoint = "https://api.deepseek.com/v1/chat/completions";
      model = "deepseek-chat";
    } else {
      apiKey = process.env.OPENAI_API_KEY;
      endpoint = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
    }

    console.log(`[Chat API] Configuration - Provider: ${provider}, Endpoint: ${endpoint}, Model: ${model}, API Key: ${apiKey ? 'Present' : 'Missing'}`);

    if (!apiKey) {
      console.error(`[Chat API] ${provider.toUpperCase()} API Key not configured`);
      console.error(`[Chat API] Expected environment variable: ${provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'}`);
      console.error(`[Chat API] Current NODE_ENV: ${process.env.NODE_ENV}`);
      
      return NextResponse.json({
        success: false,
        error: `${provider.toUpperCase()} API Key 未配置，请在Railway环境变量中设置 ${provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'}`
      }, { status: 500 });
    }

    // 调用AI API
    console.log(`[Chat API] Making request to ${provider} API...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是一个智能助手，请用中文回答用户的问题。回答应该准确、有帮助且友好。"
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log(`[Chat API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Chat API] ${provider} API error (${response.status}):`, errorData);
      
      // Provide more specific error messages based on status codes
      let userErrorMessage = `AI 服务暂时不可用，请稍后再试（${provider} API 错误: ${response.status}）`;
      
      if (response.status === 401) {
        userErrorMessage = `${provider.toUpperCase()} API 密钥无效或已过期，请检查Railway环境变量中的密钥配置`;
      } else if (response.status === 429) {
        userErrorMessage = `${provider.toUpperCase()} API 请求频率超限，请稍后再试`;
      } else if (response.status === 400) {
        userErrorMessage = `请求格式错误，请重新发送消息`;
      }
      
      return NextResponse.json({
        success: false,
        error: userErrorMessage
      }, { status: 500 });
    }

    const data = await response.json();
    console.log(`[Chat API] ${provider} response received, choices: ${data.choices?.length || 0}`);
    
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      console.error(`[Chat API] Empty response from ${provider}:`, data);
      return NextResponse.json({
        success: false,
        error: "AI 服务返回了空响应，请稍后再试"
      }, { status: 500 });
    }

    console.log(`[Chat API] Success - Response length: ${aiResponse.length}`);
    return NextResponse.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('[Chat API] Unexpected error:', error);
    
    // Provide more context about the error
    let errorMessage = "AI 服务暂时不可用，请稍后再试";
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = "网络连接错误，请检查网络设置后重试";
    } else if (error instanceof SyntaxError) {
      errorMessage = "服务响应格式错误，请稍后再试";
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}