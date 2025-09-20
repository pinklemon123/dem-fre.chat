import Link from "next/link";
import NavClient from "../components/NavClient";
import QuickPostComposer from "../components/QuickPostComposer";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import {
  formatPostAuthor,
  normalizePostRows,
  type Post,
  type PostRow,
} from "../lib/posts";
import { getServerSupabaseClient } from "../lib/supabase/server";

export const revalidate = 0;

type Item = { title: string; meta: string; content: string };

const factions: Item[] = [
  { title: "技术派", meta: "成员：200+", content: "专注技术交流与分享" },
  { title: "生活派", meta: "成员：300+", content: "关注生活、情感、成长" },
  { title: "AI 先锋", meta: "成员：500+", content: "AI 相关话题讨论" },
];

const ranking: Item[] = [
  { title: "小明", meta: "积分：1800", content: "本月发帖最多" },
  { title: "AI达人", meta: "积分：1700", content: "热帖贡献者" },
  { title: "管理员", meta: "积分：1600", content: "论坛维护" },
];


async function fetchLatestPosts(): Promise<{ posts: Post[]; error: string | null }> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,content,created_at,profiles(username,email)")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    const posts = normalizePostRows(data as PostRow[] | null);

    return { posts, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "加载帖子失败";
    console.error("Failed to load posts", error);
    return { posts: [], error: message };
  }
}


function InfoCard({ item }: { item: Item }) {
  return (
    <div className="info-card">
      <div className="info-title">{item.title}</div>
      <div className="info-meta">{item.meta}</div>
      <div className="info-content">{item.content}</div>
    </div>
  );
}

export default async function HomePage() {
  const { posts, error } = await fetchLatestPosts();

  return (
    <main className="home-shell">
      <header className="site-header">
        <div className="logo"><Link href="/">论坛Logo</Link></div>
        <NavClient
          links={[
            { href: "#hot", label: "热帖" },

            { href: "#factions", label: "热门派别" },
            { href: "#ranking", label: "用户排行" },

            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <h1>分享观点，连接志同道合的伙伴</h1>
          <p>
            登录后即可在社区中发布帖子、参与讨论，还能查看自己的发帖记录。试试新的快速发帖器，几秒钟就能把想法晒出来。
          </p>
          <div className="hero-links">
            <Link href="#hot" className="primary">浏览最新帖子</Link>
            <Link href="/posts/new" className="ghost">去到完整发帖页</Link>
          </div>
        </div>
        <div className="hero-preview" aria-hidden>
          <div className="preview-card" />
          <div className="preview-card" />
          <div className="preview-card" />
        </div>
      </section>

      <div className="home-grid">
        <section className="post-feed" id="hot">
          <div className="section-head">
            <h2>🔥 最新帖子</h2>
            <span>实时同步社区讨论</span>
          </div>
          <QuickPostComposer />
          {error ? (
            <p className="feed-empty">{error}</p>
          ) : posts.length === 0 ? (
            <p className="feed-empty">暂时还没有帖子，成为第一个发帖的人吧！</p>
          ) : (
            <div className="feed-list">
              {posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <header>
                    <h3>{post.title}</h3>
                    <span>{formatPostAuthor(post)}</span>
                  </header>
                  <p>{post.content}</p>
                  <footer>
                    <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
                    <Link href={`/posts/${post.id}`} className="ghost" prefetch={false}>
                      查看详情
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="home-aside">
          <section id="factions">
            <div className="section-head">
              <h2>热门派别</h2>
            </div>
            <div className="info-list">
              {factions.map((item) => (
                <InfoCard key={item.title} item={item} />
              ))}
            </div>
          </section>
          <section id="ranking">
            <div className="section-head">
              <h2>用户排行</h2>
            </div>
            <div className="info-list">
              {ranking.map((item) => (
                <InfoCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer>
        <p>© 2025 论坛网站</p>
      </footer>
    </main>
  );
}
