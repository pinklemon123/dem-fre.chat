import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "../../../lib/supabase/server";
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // 验证cron请求（可选，增加安全性）
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 执行Python新闻爬虫脚本
    const pythonPath = resolvePythonPath()

    if (!pythonPath) {
      console.error('Unable to locate a Python interpreter. Set PYTHON_PATH to a valid executable.')
      return NextResponse.json({
        success: false,
        error: '未找到可用的 Python 解释器，请检查服务器配置。'
      }, { status: 500 })
    }

    return new Promise<Response>((resolve) => {

      const scriptPath = path.join(process.cwd(), 'src', 'lib', 'enhanced_newsbot.py')

      if (!existsSync(scriptPath)) {
        console.error('Python script not found at path:', scriptPath)
        resolve(NextResponse.json({
          success: false,
          error: '新闻机器人脚本不存在',
        }, { status: 500 }))
        return
      }

      
      const python = spawn(pythonPath, [scriptPath])

      let output = ''
      let errorOutput = ''
      let isResolved = false
      let timeout: NodeJS.Timeout | null = null

      const clearAndResolve = (response: Response) => {
        if (isResolved) return
        isResolved = true
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        resolve(response)
      }

      python.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })

      python.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString()
      })

      python.on('error', (error: Error) => {
        console.error('Failed to start Python process:', error)
        clearAndResolve(NextResponse.json({
          success: false,
          error: '新闻机器人启动失败',
          details: error.message
        }, { status: 500 }))
      })

      python.on('close', (code: number) => {
        if (isResolved) return
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        if (code === 0) {
          clearAndResolve(NextResponse.json({
            success: true,
            message: '新闻机器人执行成功',
            output: output
          }))
        } else {
          console.error('Python script failed:', errorOutput)
          clearAndResolve(NextResponse.json({
            success: false,
            error: '新闻机器人执行失败',
            details: errorOutput
          }, { status: 500 }))
        }
      })

      // 5分钟超时
      timeout = setTimeout(() => {
        if (isResolved) return
        isResolved = true
        python.kill()
        resolve(NextResponse.json({
          success: false,
          error: '新闻机器人执行超时'
        }, { status: 408 }))
        timeout = null
      }, 300000)
    })
    
  } catch (error) {
    console.error('Newsbot API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function resolvePythonPath(): string | null {
  const candidates = [
    process.env.PYTHON_PATH,
    'python3',
    'python',
    'python3.11'
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'])
    if (!result.error && result.status === 0) {
      return candidate
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    // 验证请求权限（可选：检查是否为管理员）
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "run") {
      const authResult = await ensureAdmin(request);
      if (!authResult.ok) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error
          },
          { status: authResult.status }
        );
      }
      // 手动执行新闻抓取
      return await GET(request);
    }

    if (action === "status") {
      // 获取机器人状态
      return await getBotStatus();
    }

    return NextResponse.json({ error: "无效的操作" }, { status: 400 });

  } catch (error) {
    console.error("新闻机器人API错误:", error);
    return NextResponse.json(
      { error: "服务器错误" }, 
      { status: 500 }
    );
  }
}

async function getBotStatus() {
  try {
    const supabase = getServerSupabaseClient();

    // 获取新闻机器人的用户ID，确保和前后端配置一致
    const botUserId = process.env.NEWS_BOT_USER_ID || process.env.NEXT_PUBLIC_NEWS_BOT_USER_ID;

    if (!botUserId) {
      return NextResponse.json({
        success: false,
        error: "未找到新闻机器人账号 ID，请配置 NEWS_BOT_USER_ID 环境变量。"
      }, { status: 500 });
    }

    // 获取今日发帖数
    const today = new Date().toISOString().split('T')[0];
    const { data: todayPosts, error: todayError } = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .eq("user_id", botUserId)
      .gte("created_at", `${today}T00:00:00`);

    if (todayError) throw todayError;

    // 获取最后一次发帖时间
    const { data: lastPost, error: lastError } = await supabase
      .from("posts")
      .select("created_at")
      .eq("user_id", botUserId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastError) throw lastError;

    // 获取总发帖数
    const { data: totalPosts, error: totalError } = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .eq("user_id", botUserId);

    if (totalError) throw totalError;

    return NextResponse.json({
      success: true,
      status: {
        botUserId,
        todayPosts: todayPosts?.length || 0,
        totalPosts: totalPosts?.length || 0,
        lastRun: lastPost?.[0]?.created_at || null,
        isRunning: false // 这里可以从某个状态文件或数据库字段读取
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "获取状态失败" 
    }, { status: 500 });
  }
}

async function ensureAdmin(request: NextRequest): Promise<{
  ok: boolean;
  status: number;
  error?: string;
}> {
  const adminList = process.env.NEWS_BOT_ADMIN_IDS;
  if (!adminList) {
    return { ok: true, status: 200 };
  }

  const adminIds = adminList
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (adminIds.length === 0) {
    return { ok: true, status: 200 };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "缺少授权信息" };
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, status: 401, error: "无效的会话" };
    }

    if (!adminIds.includes(data.user.id)) {
      return { ok: false, status: 403, error: "无权限执行该操作" };
    }

    return { ok: true, status: 200 };
  } catch (error) {
    console.error("验证管理员权限失败:", error);
    return { ok: false, status: 500, error: "管理员权限验证失败" };
  }
}
