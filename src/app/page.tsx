import Link from "next/link";
import NavClient from "../components/NavClient";

type Item = { title: string; meta: string; content: string };

const hotPosts: Item[] = [
  { title: "如何提升论坛活跃度？", meta: "作者：小明 | 2025-09-18", content: "大家有什么建议？欢迎讨论～" },
  { title: "本月热门话题：AI与社会", meta: "作者：AI达人 | 2025-09-17", content: "AI 技术对社会的影响，你怎么看？" },
  { title: "新用户积分规则说明", meta: "作者：管理员 | 2025-09-16", content: "积分如何获取与排名，详细说明。" },
];

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

function Card({ item }: { item: Item }) {
  return (
    <div className="card">
      <div className="card-title">{item.title}</div>
      <div className="card-meta">{item.meta}</div>
      <div className="card-content">{item.content}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <header>
        <div className="logo"><Link href="/">论坛Logo</Link></div>
        <NavClient
          links={[
            { href: "#hot", label: "热帖" },
            { href: "/factions", label: "热门派别" },
            { href: "/ranking", label: "用户排行" },
            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>

      <section id="hot">
        <h2>🔥 热帖精选</h2>
        <div className="card-list">
          {hotPosts.map((it, idx) => (
            <Card key={idx} item={it} />
          ))}
        </div>
      </section>

      <section id="factions">
        <h2>热门派别</h2>
        <div className="card-list">
          {factions.map((it, idx) => (
            <Card key={idx} item={it} />
          ))}
        </div>
      </section>

      <section id="ranking">
        <h2>用户排行</h2>
        <div className="card-list">
          {ranking.map((it, idx) => (
            <Card key={idx} item={it} />
          ))}
        </div>
      </section>

      <footer>
        <p>
          © 2025 论坛网站
          <a href="https://www.wyzxwk.com/" target="_blank" rel="noreferrer" />
        </p>
      </footer>
    </main>
  );
}
