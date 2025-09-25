#!/usr/bin/env python3
"""
Main entry point for Python components of dem-fre.chat

This file serves as the entry point for deployment platforms like Railpack
that expect a main.py file for Python projects. This project is primarily
a Next.js application with Python serverless functions for news processing.

For the newsbot functionality, this script can run the enhanced newsbot
processing pipeline directly.
"""

import os
import sys
from pathlib import Path

# Add the src/lib directory to the Python path
project_root = Path(__file__).parent
src_lib_path = project_root / "src" / "lib"
if str(src_lib_path) not in sys.path:
    sys.path.insert(0, str(src_lib_path))

def run_newsbot():
    """Run the enhanced newsbot processing pipeline"""
    try:
        from enhanced_newsbot import EnhancedNewsBot
        
        print("🤖 Starting Enhanced NewsBot...")
        bot = EnhancedNewsBot()
        result = bot.run_once()
        
        if result['success']:
            print("✅ NewsBot completed successfully!")
            print(f"📊 Articles processed: {result.get('articles_processed', 0)}")
            print(f"⏱️  Processing time: {result.get('processing_time', 0)} seconds")
            
            # Display processed articles
            if result.get('articles'):
                print("\n📰 Processed articles:")
                for i, article in enumerate(result['articles'][:5], 1):
                    title = article.get('title_zh', article.get('title', 'Untitled'))
                    print(f"  {i}. {title[:80]}...")
        else:
            print(f"❌ NewsBot failed: {result.get('error', 'Unknown error')}")
            return 1
            
    except ImportError as e:
        print(f"❌ Failed to import NewsBot module: {e}")
        print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ NewsBot execution failed: {e}")
        return 1
    
    return 0

def show_info():
    """Display information about this project"""
    print("🚀 dem-fre.chat - Democratic Free Chat Platform")
    print("=" * 50)
    print("This is a Next.js application with Python serverless functions.")
    print()
    print("🌐 Web Application: Built with Next.js, React, and TypeScript")
    print("🤖 NewsBot: Python-based news processing and translation")
    print("🗄️  Database: Supabase for data storage")
    print()
    print("Available commands:")
    print("  python main.py newsbot  - Run the newsbot processing pipeline")
    print("  python main.py info     - Show this information")
    print()
    print("For web development:")
    print("  npm run dev    - Start development server")
    print("  npm run build  - Build for production")
    print("  npm run start  - Start production server")

def main():
    """Main entry point"""
    # Handle command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "newsbot":
            return run_newsbot()
        elif command == "info":
            show_info()
            return 0
        else:
            print(f"❌ Unknown command: {command}")
            print("💡 Available commands: newsbot, info")
            return 1
    
    # Default behavior - show info and run newsbot if environment is configured
    show_info()
    
    # Check if this looks like a production environment with newsbot configured
    if os.getenv("NEWS_BOT_USER_ID") or os.getenv("NEXT_PUBLIC_NEWS_BOT_USER_ID"):
        print("\n🤖 NewsBot configuration detected, running newsbot...")
        return run_newsbot()
    else:
        print("\n💡 No NewsBot configuration found.")
        print("   Set NEWS_BOT_USER_ID to enable automatic newsbot execution.")
        return 0

if __name__ == "__main__":
    sys.exit(main())