import Link from "next/link";
import NavClient from "../../components/NavClient";

type Item = { title: string; meta: string; content: string };

const ranking: Item[] = [
  { title: "小明", meta: "积分：1800", content: "本月发帖最多" },
  { title: "AI达人", meta: "积分：1700", content: "热帖贡献者" },
  { title: "管理员", meta: "积分：1600", content: "论坛维护" },
];

function Card({ item }: { item: Item }) {
  return (
    <div className="card">
      <div className="card-title">{item.title}</div>
      <div className="card-meta">{item.meta}</div>
      <div className="card-content">{item.content}</div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <main>
      <header className="site-header">
        <div className="logo">
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="民主复兴" 
              className="logo-image"
            />
          </Link>
        </div>
        <NavClient
          links={[
            { href: "/#hot", label: "热帖" },
            { href: "/factions", label: "热门派别" },
            { href: "/ranking", label: "用户排行" },
            { href: "https://newschat-production.up.railway.app/static/index.html", label: "新闻机器人" },
            { href: "/chat", label: "聊天对话" },
            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>

      <section>
        <h2>用户排行</h2>
        <div className="card-list">
          {ranking.map((it, i) => (
            <Card key={i} item={it} />
          ))}
        </div>
      </section>
    </main>
  );
}

