import Link from "next/link";
import NavClient from "../../components/NavClient";

type Item = { title: string; meta: string; content: string };

const factions: Item[] = [
  { title: "技术派", meta: "成员：200+", content: "专注技术交流与分享" },
  { title: "生活派", meta: "成员：300+", content: "关注生活、情感、成长" },
  { title: "AI 先锋", meta: "成员：500+", content: "AI 相关话题讨论" },
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

export default function FactionsPage() {
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
        <h2>热门派别</h2>
        <div className="card-list">
          {factions.map((it, i) => (
            <Card key={i} item={it} />
          ))}
        </div>
      </section>
    </main>
  );
}

