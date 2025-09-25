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

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: `${provider.toUpperCase()} API Key 未配置，请在环境变量中设置相应的API密钥`
      }, { status: 500 });
    }

    // 调用AI API
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${provider} API error:`, errorData);
      return NextResponse.json({
        success: false,
        error: `AI 服务暂时不可用，请稍后再试（${provider} API 错误: ${response.status}）`
      }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return NextResponse.json({
        success: false,
        error: "AI 服务返回了空响应，请稍后再试"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: "AI 服务暂时不可用，请稍后再试"
    }, { status: 500 });
  }
}