#!/usr/bin/env python3
"""
新闻机器人测试脚本
快速验证RSS爬取和翻译功能

运行方式:
python test_newsbot.py
"""

import os
import sys
import time
from datetime import datetime

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from enhanced_newsbot import EnhancedNewsBot
except ImportError:
    print("❌ 无法导入 enhanced_newsbot，请确保文件存在")
    sys.exit(1)

def test_rss_fetch():
    """测试RSS获取功能"""
    print("🧪 测试RSS获取功能...")
    
    import feedparser
    
    test_feeds = [
        'http://feeds.bbci.co.uk/news/world/rss.xml',
        'http://rss.cnn.com/rss/cnn_world.rss',
        'https://www.theguardian.com/world/rss'
    ]
    
    for feed_url in test_feeds:
        try:
            print(f"   📡 测试 {feed_url}")
            feed = feedparser.parse(feed_url)
            
            if hasattr(feed, 'entries') and len(feed.entries) > 0:
                print(f"   ✅ 成功获取 {len(feed.entries)} 篇文章")
                print(f"      首篇: {feed.entries[0].title[:50]}...")
            else:
                print("   ⚠️ 未获取到文章内容")
                
        except Exception as e:
            print(f"   ❌ 失败: {e}")
    
    print()

def test_newsbot():
    """测试新闻机器人完整流程"""
    print("🤖 测试新闻机器人...")
    
    try:
        # 创建机器人实例
        bot = EnhancedNewsBot()
        
        # 运行一次完整流程
        print("   🚀 开始处理...")
        result = bot.run_once()
        
        if result['success']:
            print("   ✅ 处理成功!")
            print(f"   📊 处理文章: {result['articles_processed']} 篇")
            print(f"   ⏱️  处理时间: {result['processing_time']} 秒")
            
            # 显示文章标题
            if result.get('articles'):
                print("   📰 处理的文章:")
                for i, article in enumerate(result['articles'][:3]):
                    print(f"      {i+1}. {article.get('title_zh', article.get('title', ''))[:60]}...")
        else:
            print(f"   ❌ 处理失败: {result.get('error', '未知错误')}")
            
    except Exception as e:
        print(f"   ❌ 测试失败: {e}")
    
    print()

def check_dependencies():
    """检查依赖包"""
    print("🔍 检查依赖包...")
    
    required_packages = [
        'feedparser',
        'requests', 
        'beautifulsoup4',
        'openai'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_').replace('4', ''))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (缺失)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n💡 安装缺失包: pip install {' '.join(missing_packages)}")
    
    print()

def check_environment():
    """检查环境变量"""
    print("🔧 检查环境变量...")
    
    env_vars = [
        'OPENAI_API_KEY',
        'DEEPSEEK_API_KEY'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            print(f"   ✅ {var}: {'*' * (len(value) - 4)}{value[-4:]}")
        else:
            print(f"   ⚠️ {var}: 未设置")
    
    print()

def main():
    """主测试函数"""
    print("🧪 新闻机器人测试套件")
    print("=" * 50)
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 1. 检查依赖
    check_dependencies()
    
    # 2. 检查环境变量
    check_environment()
    
    # 3. 测试RSS获取
    test_rss_fetch()
    
    # 4. 测试完整流程
    test_newsbot()
    
    print("🎉 测试完成!")
    print()
    print("💡 使用说明:")
    print("   1. 机器人每3小时自动运行一次")
    print("   2. 每次处理5-8篇高质量英文新闻")
    print("   3. 自动翻译为中文并发布到论坛")
    print("   4. 访问 /newsbot 页面查看管理界面")

if __name__ == "__main__":
    main()