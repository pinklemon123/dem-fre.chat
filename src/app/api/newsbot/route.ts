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

    const remotePythonEndpoint = resolveRemotePythonEndpoint(request)

    if (remotePythonEndpoint) {
      return await executeViaRemotePython(remotePythonEndpoint, request)
    }

    // 执行Python新闻爬虫脚本
    const pythonPath = resolvePythonPath()

    if (!pythonPath) {
      console.error('Unable to locate a Python interpreter. Set PYTHON_PATH to a valid executable or configure NEWSBOT_PYTHON_ENDPOINT to use the serverless Python runner.')
      return NextResponse.json({
        success: false,
        error: '未找到可用的 Python 解释器，请检查服务器配置或设置 NEWSBOT_PYTHON_ENDPOINT。'
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
  const seen = new Set<string>()
  const candidates: string[] = []

  const register = (value?: string | null) => {
    if (!value) return
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    candidates.push(trimmed)
  }

  const registerMany = (values: Array<string | undefined | null>) => {
    for (const value of values) {
      register(value)
    }
  }

  register(process.env.PYTHON_PATH)

  if (process.env.PYTHON_PATHS) {
    for (const value of process.env.PYTHON_PATHS.split(/[;,:\n]/)) {
      register(value)
    }
  }

  register(process.env.VERCEL_PYTHON)
  register(process.env.PIPENV_PYTHON)

  if (process.env.PYENV_ROOT) {
    register(path.join(process.env.PYENV_ROOT, 'shims', 'python3'))
    register(path.join(process.env.PYENV_ROOT, 'bin', 'python3'))
  }

  registerMany([
    'python3.11',
    'python3.10',
    'python3.9',
    'python3.8',
    'python3',
    'python'
  ])

  registerMany([
    '/var/task/python/bin/python3',
    '/var/lang/bin/python3.11',
    '/var/lang/bin/python3.10',
    '/var/lang/bin/python3.9',
    '/usr/local/bin/python3',
    '/usr/bin/python3'
  ])

  const pathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean)
  for (const entry of pathEntries) {
    register(path.join(entry, 'python3'))
    register(path.join(entry, 'python'))
  }

  for (const lookup of ['python3', 'python', 'python3.11', 'python3.10', 'python3.9']) {
    try {
      const whichResult = spawnSync('which', [lookup])
      if (!whichResult.error && whichResult.status === 0) {
        const resolved = whichResult.stdout.toString().trim()
        if (resolved) {
          register(resolved)
        }
      }
    } catch {
      // Ignore environments that do not provide `which`.
    }
  }

  for (const candidate of candidates) {
    try {
      const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' })
      if (!result.error && result.status === 0) {
        return candidate
      }
    } catch {
      // Ignore invalid or non-executable candidates and continue checking others.
    }
  }

  return null
}

function resolveRemotePythonEndpoint(request: NextRequest): URL | null {
  const baseUrl = new URL(request.url)
  const directConfig = process.env.NEWSBOT_PYTHON_ENDPOINT?.trim()

  if (directConfig) {
    try {
      const resolved = new URL(directConfig, baseUrl.origin)
      if (resolved.href !== baseUrl.href) {
        return resolved
      }
    } catch (error) {
      console.error('Invalid NEWSBOT_PYTHON_ENDPOINT value. Provide an absolute URL or a path starting with /.', error)
    }
  }

  const fallbackPath = (process.env.NEWSBOT_PYTHON_FUNCTION_PATH || '/api/newsbot-python').trim()

  if (process.env.VERCEL && fallbackPath) {
    try {
      const pathValue = fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`
      const resolved = new URL(pathValue, baseUrl.origin)
      if (resolved.pathname !== baseUrl.pathname || resolved.search !== baseUrl.search) {
        return resolved
      }
    } catch (error) {
      console.error('Failed to build fallback Python endpoint URL from NEWSBOT_PYTHON_FUNCTION_PATH.', error)
    }
  }

  return null
}

async function executeViaRemotePython(endpoint: URL, request: NextRequest): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      'x-newsbot-proxy': '1'
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['authorization'] = authHeader
    }

    const remoteResponse = await fetch(endpoint, {
      method: 'POST',
      headers
    })

    const text = await remoteResponse.text()
    let payload: unknown = null

    if (text) {
      try {
        payload = JSON.parse(text)
      } catch (parseError) {
        console.error('Remote Python function returned invalid JSON.', parseError, text)
        return NextResponse.json({
          success: false,
          error: 'Python 服务返回了无法解析的响应',
          details: text
        }, { status: 502 })
      }
    }

    const body = (payload && typeof payload === 'object') ? payload : {
      success: remoteResponse.ok,
      data: payload
    }

    return NextResponse.json(body as Record<string, unknown>, { status: remoteResponse.status })
  } catch (error) {
    console.error('Failed to invoke remote Python endpoint for newsbot.', error)
    return NextResponse.json({
      success: false,
      error: '调用 Python 服务失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 502 })
  }
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
