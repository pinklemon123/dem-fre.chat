import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

interface DebugResponse {
  environment: {
    openai_key: string;
    deepseek_key: string;
    node_env: string;
    platform: string;
  };
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<DebugResponse>> {
  try {
    // Get environment info without exposing actual keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    
    const response = {
      environment: {
        openai_key: openaiKey ? `配置已设置 (${openaiKey.substring(0, 3)}...${openaiKey.substring(openaiKey.length - 4)})` : "未配置",
        deepseek_key: deepseekKey ? `配置已设置 (${deepseekKey.substring(0, 3)}...${deepseekKey.substring(deepseekKey.length - 4)})` : "未配置",
        node_env: process.env.NODE_ENV || "unknown",
        platform: process.platform || "unknown"
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      environment: {
        openai_key: "检查失败",
        deepseek_key: "检查失败", 
        node_env: "unknown",
        platform: "unknown"
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}