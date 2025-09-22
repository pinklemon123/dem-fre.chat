export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  status: 'idle' | 'running' | 'error';
  error_message?: string;
}

export class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks() {
    // 注册新闻爬取任务
    this.registerTask({
      id: 'news-crawler',
      name: '新闻爬取任务',
      cron: '0 */2 * * *', // 每2小时执行一次
      enabled: true,
      status: 'idle'
    });

    // 注册热点分析任务  
    this.registerTask({
      id: 'trending-analysis',
      name: '热点分析任务',
      cron: '0 */6 * * *', // 每6小时执行一次
      enabled: true,
      status: 'idle'
    });

    // 注册清理任务
    this.registerTask({
      id: 'cleanup-old-news',
      name: '清理旧新闻',
      cron: '0 2 * * *', // 每天凌晨2点执行
      enabled: true,
      status: 'idle'
    });
  }

  registerTask(task: ScheduledTask) {
    this.tasks.set(task.id, task);
    if (task.enabled) {
      this.scheduleTask(task);
    }
  }

  private scheduleTask(task: ScheduledTask) {
    // 简化的定时逻辑，实际应该使用 node-cron 或类似库
    const interval = this.parseCronToInterval(task.cron);
    if (interval > 0) {
      const timer = setInterval(async () => {
        await this.executeTask(task.id);
      }, interval);
      
      this.intervals.set(task.id, timer);
    }
  }

  private parseCronToInterval(cron: string): number {
    // 简化的 cron 解析，实际应该使用专业的 cron 解析库
    if (cron === '0 */2 * * *') return 2 * 60 * 60 * 1000; // 2小时
    if (cron === '0 */6 * * *') return 6 * 60 * 60 * 1000; // 6小时
    if (cron === '0 2 * * *') return 24 * 60 * 60 * 1000; // 24小时
    return 0;
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled) return;

    console.log(`执行定时任务: ${task.name}`);
    
    try {
      task.status = 'running';
      task.last_run = new Date().toISOString();
      
      switch (taskId) {
        case 'news-crawler':
          await this.runNewsCrawler();
          break;
        case 'trending-analysis':
          await this.runTrendingAnalysis();
          break;
        case 'cleanup-old-news':
          await this.runCleanupTask();
          break;
      }
      
      task.status = 'idle';
      task.error_message = undefined;
      
    } catch (error) {
      task.status = 'error';
      task.error_message = error instanceof Error ? error.message : '未知错误';
      console.error(`任务执行失败 ${task.name}:`, error);
    }
  }

  private async runNewsCrawler(): Promise<void> {
    // 直接执行新闻爬虫逻辑，避免内部HTTP调用
    try {
      console.log('开始执行新闻爬取任务');
      
      // 这里应该直接调用新闻爬虫逻辑
      // 而不是通过HTTP请求调用API
      
      // 模拟爬取过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('新闻爬取任务完成');
    } catch (error) {
      throw new Error(`新闻爬取失败: ${error}`);
    }
  }

  private async runTrendingAnalysis(): Promise<void> {
    // 分析热点话题
    try {
      // 获取最近的新闻数据 - 这里需要使用适当的数据库查询
      console.log('执行热点分析任务');
      
      // 直接执行分析逻辑，避免内部HTTP调用
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('热点分析任务完成');
    } catch (error) {
      throw new Error(`热点分析任务失败: ${error}`);
    }
  }

  private async runCleanupTask(): Promise<void> {
    // 清理30天前的新闻
    try {
      console.log('执行清理任务');
      
      // 直接执行清理逻辑，避免内部HTTP调用
      // 模拟清理过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('清理任务完成');
    } catch (error) {
      throw new Error(`清理任务失败: ${error}`);
    }
  }

  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  enableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    task.enabled = true;
    this.scheduleTask(task);
    return true;
  }

  disableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    task.enabled = false;
    const timer = this.intervals.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.intervals.delete(taskId);
    }
    return true;
  }

  async executeTaskManually(taskId: string): Promise<boolean> {
    try {
      await this.executeTask(taskId);
      return true;
    } catch (error) {
      console.error(`手动执行任务失败 ${taskId}:`, error);
      return false;
    }
  }
}

// 全局调度器实例
export const globalScheduler = new TaskScheduler();