"""
增强版新闻机器人 - 支持英美新闻源和自动翻译
集成RSS爬取、AI翻译、智能分析功能

特性:
1. 支持BBC、CNN、Reuters等英美主流媒体
2. 自动翻译英文新闻为中文
3. 智能内容过滤和质量评估
4. 自动去重和分类
5. 完全自主运行，无需手动配置
"""

import os
import re
import json
import time
import hashlib
import feedparser
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class EnhancedNewsBot:
    def __init__(self):
        # API配置
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        
        # 英美新闻源配置 - 使用RSS确保稳定性
        self.news_sources = [
            {
                'id': 'bbc_world',
                'name': 'BBC World News',
                'rss_url': 'http://feeds.bbci.co.uk/news/world/rss.xml',
                'category': '国际新闻',
                'enabled': True
            },
            {
                'id': 'cnn_world',
                'name': 'CNN World',
                'rss_url': 'http://rss.cnn.com/rss/cnn_world.rss',
                'category': '国际新闻',
                'enabled': True
            },
            {
                'id': 'reuters_world',
                'name': 'Reuters World',
                'rss_url': 'https://www.reuters.com/tools/rss/world',
                'category': '国际新闻',
                'enabled': True
            },
            {
                'id': 'guardian_world',
                'name': 'Guardian World',
                'rss_url': 'https://www.theguardian.com/world/rss',
                'category': '国际新闻',
                'enabled': True
            },
            {
                'id': 'ap_news',
                'name': 'Associated Press',
                'rss_url': 'https://apnews.com/index.rss',
                'category': '国际新闻',
                'enabled': True
            }
        ]
        
        # 爬取配置
        self.config = {
            'max_articles_per_source': 2,  # 每个源最多2篇
            'total_max_articles': 8,       # 总共最多8篇
            'min_content_length': 200,     # 最小内容长度
            'quality_threshold': 0.75,     # 质量阈值
            'auto_translate': True,        # 自动翻译
            'auto_post': True             # 自动发布
        }
        
        # HTTP会话
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def fetch_rss_articles(self) -> List[Dict]:
        """从所有RSS源获取新闻文章"""
        all_articles = []
        
        for source in self.news_sources:
            if not source['enabled']:
                continue
                
            try:
                print(f"📡 正在爬取 {source['name']}...")
                articles = self._fetch_single_rss(source)
                all_articles.extend(articles)
                time.sleep(2)  # 避免请求过于频繁
                
            except Exception as e:
                print(f"❌ 爬取失败 {source['name']}: {e}")
                continue
        
        # 按质量和时间排序，选择最好的文章
        all_articles.sort(key=lambda x: (x.get('quality_score', 0), x.get('published_time', 0)), reverse=True)
        return all_articles[:self.config['total_max_articles']]
    
    def _fetch_single_rss(self, source: Dict) -> List[Dict]:
        """从单个RSS源获取文章"""
        try:
            feed = feedparser.parse(source['rss_url'])
            articles = []
            
            for entry in feed.entries[:self.config['max_articles_per_source']]:
                article = {
                    'title': entry.title,
                    'link': entry.link,
                    'description': getattr(entry, 'description', ''),
                    'published': getattr(entry, 'published', ''),
                    'source_name': source['name'],
                    'source_id': source['id'],
                    'category': source['category'],
                    'language': 'en'
                }
                
                # 获取完整内容
                content = self._extract_article_content(entry.link)
                if content and len(content) >= self.config['min_content_length']:
                    article['content'] = content
                    article['quality_score'] = self._calculate_quality_score(article)
                    articles.append(article)
                    
            return articles
            
        except Exception as e:
            print(f"RSS解析失败: {e}")
            return []
    
    def _extract_article_content(self, url: str) -> Optional[str]:
        """提取文章完整内容"""
        try:
            response = self.session.get(url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 移除脚本和样式
            for script in soup(["script", "style", "nav", "footer", "aside"]):
                script.decompose()
            
            # 尝试多种内容选择器
            content_selectors = [
                '[data-component="text-block"]',  # BBC
                '.article-content',               # 通用
                '.story-body',                   # CNN
                '.article-body',                 # Guardian
                '.StandardArticleBody_body'      # Reuters
            ]
            
            content = ""
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    content = ' '.join([elem.get_text().strip() for elem in elements])
                    break
            
            if not content:
                # 后备方案：查找主要段落
                paragraphs = soup.find_all('p')
                content = ' '.join([p.get_text().strip() for p in paragraphs[:10]])
            
            return self._clean_text(content)
            
        except Exception as e:
            print(f"内容提取失败 {url}: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """清理文本内容"""
        if not text:
            return ""
        
        # 移除多余空白
        text = re.sub(r'\s+', ' ', text).strip()
        
        # 移除广告和版权信息
        patterns_to_remove = [
            r'subscribe to.*?newsletter',
            r'follow us on.*?twitter',
            r'copyright.*?\d{4}',
            r'all rights reserved',
            r'terms of use',
            r'privacy policy'
        ]
        
        for pattern in patterns_to_remove:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text.strip()
    
    def _calculate_quality_score(self, article: Dict) -> float:
        """计算文章质量分数"""
        score = 0.5  # 基础分数
        
        content = article.get('content', '')
        title = article.get('title', '')
        
        # 内容长度评分
        if len(content) > 500:
            score += 0.2
        if len(content) > 1000:
            score += 0.1
        
        # 标题质量评分
        if len(title) > 20 and len(title) < 100:
            score += 0.1
        
        # 关键词评分（国际新闻相关）
        important_keywords = [
            'politics', 'economy', 'technology', 'science', 'climate',
            'international', 'global', 'world', 'breaking'
        ]
        
        content_lower = content.lower()
        for keyword in important_keywords:
            if keyword in content_lower:
                score += 0.05
        
        return min(score, 1.0)  # 最高1.0分
    
    def translate_to_chinese(self, text: str, text_type: str = "content") -> str:
        """使用AI API翻译英文为中文"""
        if not text or not self.config['auto_translate']:
            return text
        
        try:
            if self.deepseek_key:
                return self._translate_with_deepseek(text, text_type)
            elif self.openai_key:
                return self._translate_with_openai(text, text_type)
            else:
                print("⚠️ 未配置AI API密钥，跳过翻译")
                return text
                
        except Exception as e:
            print(f"翻译失败: {e}")
            return text
    
    def _translate_with_deepseek(self, text: str, text_type: str) -> str:
        """使用DeepSeek API翻译"""
        try:
            headers = {
                'Authorization': f'Bearer {self.deepseek_key}',
                'Content-Type': 'application/json'
            }
            
            prompt = f"""请将以下英文新闻{text_type}翻译成自然流畅的中文。要求：
1. 保持原文的准确性和完整性
2. 使用符合中文表达习惯的语言
3. 保留专有名词（人名、地名、机构名）的常见中文译名
4. 确保新闻的客观性和专业性

英文内容：
{text}

中文翻译："""

            data = {
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 2000
            }
            
            response = requests.post(
                'https://api.deepseek.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            else:
                print(f"DeepSeek API错误: {response.status_code}")
                return text
                
        except Exception as e:
            print(f"DeepSeek翻译失败: {e}")
            return text
    
    def _translate_with_openai(self, text: str, text_type: str) -> str:
        """使用OpenAI API翻译"""
        try:
            import openai
            openai.api_key = self.openai_key
            
            prompt = f"""将以下英文新闻{text_type}翻译成中文，要求准确、流畅、符合中文表达习惯：

{text}"""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI翻译失败: {e}")
            return text
    
    def generate_summary(self, content: str) -> str:
        """生成新闻摘要"""
        if not content:
            return ""
        
        try:
            # 提取前3段作为摘要
            sentences = content.split('.')
            summary_sentences = sentences[:3]
            summary = '. '.join(summary_sentences).strip()
            
            if len(summary) > 200:
                summary = summary[:200] + "..."
            
            return summary
            
        except Exception as e:
            print(f"摘要生成失败: {e}")
            return content[:200] + "..." if len(content) > 200 else content
    
    def is_duplicate(self, title: str, content: str) -> bool:
        """检查是否为重复文章（简化版）"""
        try:
            # 计算内容哈希
            content_hash = hashlib.md5(title.encode() + content[:500].encode()).hexdigest()
            
            # 这里应该查询数据库检查是否已存在
            # 暂时返回False，实际使用时需要实现数据库查询
            return False
            
        except Exception:
            return False
    
    def process_articles(self) -> List[Dict]:
        """处理所有文章：爬取、翻译、分析"""
        print("🤖 新闻机器人开始工作...")
        
        # 1. 爬取RSS文章
        articles = self.fetch_rss_articles()
        print(f"📰 获取到 {len(articles)} 篇高质量文章")
        
        processed_articles = []
        
        for article in articles:
            try:
                print(f"📝 处理文章: {article['title'][:50]}...")
                
                # 2. 质量过滤
                if article.get('quality_score', 0) < self.config['quality_threshold']:
                    print("   ⚠️ 质量不达标，跳过")
                    continue
                
                # 3. 重复检查
                if self.is_duplicate(article['title'], article.get('content', '')):
                    print("   ⚠️ 重复内容，跳过")
                    continue
                
                # 4. 翻译标题和内容
                if self.config['auto_translate']:
                    print("   🌐 翻译中...")
                    article['title_zh'] = self.translate_to_chinese(article['title'], "标题")
                    article['content_zh'] = self.translate_to_chinese(article.get('content', ''), "内容")
                    article['summary_zh'] = self.generate_summary(article['content_zh'])
                else:
                    article['title_zh'] = article['title']
                    article['content_zh'] = article.get('content', '')
                    article['summary_zh'] = self.generate_summary(article['content_zh'])
                
                # 5. 格式化为论坛帖子
                formatted_post = self._format_for_forum(article)
                article['forum_post'] = formatted_post
                
                processed_articles.append(article)
                print("   ✅ 处理完成")
                
                time.sleep(1)  # 避免API限制
                
            except Exception as e:
                print(f"   ❌ 处理失败: {e}")
                continue
        
        print(f"🎉 共处理完成 {len(processed_articles)} 篇文章")
        return processed_articles
    
    def _format_for_forum(self, article: Dict) -> Dict:
        """格式化文章为论坛帖子格式"""
        title = article['title_zh']
        content = article['content_zh']
        summary = article['summary_zh']
        source = article['source_name']
        original_link = article['link']
        
        # 构建论坛帖子内容
        forum_content = f"""**{summary}**

{content}

---
**来源**: {source}  
**原文链接**: {original_link}  
**发布时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}  

*本内容由新闻机器人自动抓取并翻译，仅供参考*
"""
        
        return {
            'title': title,
            'content': forum_content,
            'category': article['category'],
            'source': source,
            'original_url': original_link,
            'author': 'NewsBot',
            'created_at': datetime.now().isoformat()
        }
    
    def run_once(self) -> Dict:
        """执行一次完整的新闻处理流程"""
        start_time = time.time()
        
        try:
            # 处理文章
            articles = self.process_articles()
            
            # 统计信息
            stats = {
                'success': True,
                'articles_processed': len(articles),
                'articles_posted': 0,  # 实际发布时更新
                'processing_time': round(time.time() - start_time, 2),
                'timestamp': datetime.now().isoformat(),
                'articles': articles
            }
            
            print(f"📊 运行统计:")
            print(f"   处理文章: {stats['articles_processed']} 篇")
            print(f"   处理时间: {stats['processing_time']} 秒")
            
            return stats
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'processing_time': round(time.time() - start_time, 2),
                'timestamp': datetime.now().isoformat()
            }

# 使用示例
def main():
    """主函数 - 可以直接运行测试"""
    bot = EnhancedNewsBot()
    result = bot.run_once()
    
    if result['success']:
        print("✅ 新闻机器人运行成功！")
        for article in result['articles']:
            print(f"📰 {article['title_zh']}")
    else:
        print(f"❌ 运行失败: {result['error']}")

if __name__ == "__main__":
    main()