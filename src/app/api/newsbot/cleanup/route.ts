import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { days = 30 } = await request.json();
    
    console.log(`开始清理 ${days} 天前的数据`);
    
    // 模拟清理过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockCleanup = {
      deleted_articles: 15,
      cleaned_at: new Date().toISOString(),
      days_threshold: days
    };
    
    return NextResponse.json({
      success: true,
      message: `成功清理 ${mockCleanup.deleted_articles} 条旧数据`,
      data: mockCleanup
    });
    
  } catch (error) {
    console.error('清理任务失败:', error);
    return NextResponse.json(
      { error: '清理任务失败' },
      { status: 500 }
    );
  }
}