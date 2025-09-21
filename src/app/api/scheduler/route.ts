import { NextRequest, NextResponse } from 'next/server';
import { globalScheduler } from '../../../lib/scheduler';

export async function GET() {
  try {
    const tasks = globalScheduler.getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, taskId } = await request.json();

    switch (action) {
      case 'enable':
        const enabled = globalScheduler.enableTask(taskId);
        return NextResponse.json({ success: enabled });

      case 'disable':
        const disabled = globalScheduler.disableTask(taskId);
        return NextResponse.json({ success: disabled });

      case 'execute':
        const executed = await globalScheduler.executeTaskManually(taskId);
        return NextResponse.json({ success: executed });

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('任务操作失败:', error);
    return NextResponse.json(
      { error: '任务操作失败' },
      { status: 500 }
    );
  }
}