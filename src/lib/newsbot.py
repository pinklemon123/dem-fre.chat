"""
新闻机器人 - 论坛集成版
整合原有新闻系统，自动发帖到论坛

功能:
1. 集成原有的新闻抓取和分析功能
2. 自动发布到 Supabase 论坛
3. 支持定时任务
4. 智能去重和质量控制
"""

import os
import re
import json
import time
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Supabase 集成
from supabase import create_client, Client

# 配置
class NewsBot:
    def __init__(self):
        # Supabase 配置
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase: Optional[Client] = None
        
        # AI API 配置
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
        
        # 机器人配置
        self.bot_user_id = os.getenv("NEWS_BOT_USER_ID")  # 需要创建专门的机器人账号
        
        # 新闻源配置
        self.news_sources = [
            {
                "name": "BBC中文",
                "url": "https://www.bbc.com/zhongwen/simp",
                "domain": "bbc.com"
            },
            {
                "name": "央视新闻",
                "url": "https://news.cctv.com/",
                "domain": "cctv.com"
            }
        ]
        
        self.init_supabase()
    
    def init_supabase(self):
        """初始化 Supabase 客户端"""
        if self.supabase_url and self.supabase_key:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            print("✅ Supabase 连接成功")
        else:
            print("❌ Supabase 配置缺失")
    
    def fetch_html(self, url: str) -> Optional[str]:
        """获取网页HTML"""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"❌ 获取网页失败 {url}: {e}")
            return None
    
    def extract_news_links(self, html: str, base_url: str, domain: str) -> List[Dict[str, str]]:
        """从网页提取新闻链接"""
        soup = BeautifulSoup(html, "html.parser")
        links = []
        
        for link in soup.find_all("a", href=True):
            text = link.get_text(strip=True)
            href = link.get("href")
            
            if not text or len(text) < 15:
                continue
                
            full_url = urljoin(base_url, href)
            
            # 基本过滤条件
            if (domain in full_url and 
                len(text) > 15 and 
                text not in links and
                not any(ext in full_url.lower() for ext in ['.jpg', '.png', '.gif', '.mp4'])):
                
                links.append({
                    "title": text,
                    "url": full_url,
                    "source": domain
                })
        
        return links[:20]  # 限制数量
    
    def extract_article_content(self, url: str) -> Optional[Dict]:
        """提取文章内容"""
        html = self.fetch_html(url)
        if not html:
            return None
            
        soup = BeautifulSoup(html, "html.parser")
        
        # 提取标题
        title = None
        for selector in ["h1", "title", '[property="og:title"]']:
            element = soup.select_one(selector)
            if element:
                title = element.get_text(strip=True) or element.get("content")
                if title:
                    break
        
        # 提取正文
        content = ""
        for selector in ["article", ".article", ".content", ".post", "#content"]:
            element = soup.select_one(selector)
            if element:
                # 清理无用标签
                for tag in element.select("script,style,nav,header,footer,aside"):
                    tag.decompose()
                
                paragraphs = element.find_all("p")
                content = " ".join([p.get_text(strip=True) for p in paragraphs])
                break
        
        if not content:
            paragraphs = soup.find_all("p")
            content = " ".join([p.get_text(strip=True) for p in paragraphs])
        
        # 提取封面图
        image_url = None
        og_image = soup.select_one('[property="og:image"]')
        if og_image:
            image_url = og_image.get("content")
        
        if not image_url:
            first_img = soup.select_one("img")
            if first_img:
                image_url = urljoin(url, first_img.get("src", ""))
        
        return {
            "title": title,
            "content": content,
            "image_url": image_url,
            "source_url": url
        }
    
    def ai_summarize(self, title: str, content: str, provider: str = "openai") -> Optional[str]:
        """AI摘要生成"""
        if provider == "deepseek":
            api_key = self.deepseek_api_key
            endpoint = "https://api.deepseek.com/v1/chat/completions"
            model = "deepseek-chat"
        else:
            api_key = self.openai_api_key
            endpoint = "https://api.openai.com/v1/chat/completions"
            model = "gpt-4o-mini"
        
        if not api_key:
            print(f"❌ {provider.upper()} API Key 未配置")
            return None
        
        prompt = f"""请为以下新闻生成简洁的摘要，要求：
1. 控制在150字以内
2. 突出关键信息和影响
3. 语言简洁客观
4. 保持中文表达

标题：{title}
内容：{content[:2000]}

请直接输出摘要，不要其他解释。"""

        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "你是专业的新闻编辑，擅长生成简洁准确的新闻摘要。"},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 300
            }
            
            response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            print(f"❌ AI摘要失败: {e}")
            return None
    
    def check_duplicate(self, title: str, content: str) -> bool:
        """检查是否重复发帖"""
        if not self.supabase:
            return False
            
        try:
            # 生成内容指纹
            content_hash = hashlib.md5(f"{title}{content}".encode()).hexdigest()
            
            # 检查最近7天的帖子
            week_ago = (datetime.now() - timedelta(days=7)).isoformat()
            
            result = self.supabase.table("posts").select("id").eq("user_id", self.bot_user_id).gte("created_at", week_ago).execute()
            
            # 简单检查标题相似度
            for post in result.data:
                existing_title = post.get("title", "")
                if self.text_similarity(title, existing_title) > 0.8:
                    return True
            
            return False
        except Exception as e:
            print(f"❌ 重复检查失败: {e}")
            return False
    
    def text_similarity(self, text1: str, text2: str) -> float:
        """简单的文本相似度计算"""
        set1 = set(text1.replace(" ", ""))
        set2 = set(text2.replace(" ", ""))
        
        if not set1 or not set2:
            return 0.0
            
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        return intersection / union if union > 0 else 0.0
    
    def post_to_forum(self, title: str, content: str, image_url: Optional[str] = None) -> bool:
        """发布到论坛"""
        if not self.supabase or not self.bot_user_id:
            print("❌ Supabase 或机器人账号未配置")
            return False
        
        try:
            post_data = {
                "user_id": self.bot_user_id,
                "title": f"📰 {title}",
                "content": content,
                "image_url": image_url,
                "image_alt": "新闻配图"
            }
            
            result = self.supabase.table("posts").insert(post_data).execute()
            
            if result.data:
                print(f"✅ 成功发帖: {title}")
                return True
            else:
                print(f"❌ 发帖失败: {title}")
                return False
                
        except Exception as e:
            print(f"❌ 发帖异常: {e}")
            return False
    
    def run_daily_news(self, max_posts: int = 5) -> Dict:
        """执行每日新闻抓取和发布"""
        print(f"🤖 开始执行每日新闻任务 - {datetime.now()}")
        
        results = {
            "total_links": 0,
            "processed": 0,
            "posted": 0,
            "skipped": 0,
            "errors": 0
        }
        
        all_articles = []
        
        # 1. 从各新闻源抓取链接
        for source in self.news_sources:
            print(f"🔍 抓取新闻源: {source['name']}")
            
            html = self.fetch_html(source["url"])
            if not html:
                continue
                
            links = self.extract_news_links(html, source["url"], source["domain"])
            results["total_links"] += len(links)
            
            # 2. 提取文章内容
            for link in links[:10]:  # 每个源最多处理10篇
                article = self.extract_article_content(link["url"])
                if article and len(article.get("content", "")) > 200:
                    article["source_name"] = source["name"]
                    all_articles.append(article)
                    results["processed"] += 1
        
        # 3. 按内容长度排序，选择质量较高的文章
        all_articles.sort(key=lambda x: len(x.get("content", "")), reverse=True)
        selected_articles = all_articles[:max_posts * 2]  # 多选一些备用
        
        # 4. AI摘要和发布
        posted_count = 0
        for article in selected_articles:
            if posted_count >= max_posts:
                break
                
            title = article.get("title", "")
            content = article.get("content", "")
            
            # 检查重复
            if self.check_duplicate(title, content):
                print(f"⏭️  跳过重复内容: {title[:30]}...")
                results["skipped"] += 1
                continue
            
            # AI摘要
            summary = self.ai_summarize(title, content)
            if not summary:
                results["errors"] += 1
                continue
            
            # 构建帖子内容
            post_content = f"""📰 **{article.get('source_name', '新闻')}**

{summary}

🔗 [查看原文]({article.get('source_url', '')})

---
*本内容由新闻机器人自动抓取整理*"""
            
            # 发布到论坛
            if self.post_to_forum(title, post_content, article.get("image_url")):
                posted_count += 1
                results["posted"] += 1
                time.sleep(2)  # 避免频繁发帖
            else:
                results["errors"] += 1
        
        print(f"✅ 每日新闻任务完成: {results}")
        return results

# 使用示例
if __name__ == "__main__":
    bot = NewsBot()
    
    # 执行每日新闻
    results = bot.run_daily_news(max_posts=3)
    print(f"任务结果: {results}")