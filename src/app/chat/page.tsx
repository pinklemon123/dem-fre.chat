import Link from "next/link";
import ChatClient from "../../components/ChatClient";
import NavClient from "../../components/NavClient";

export default function ChatPage() {
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

      <ChatClient />
    </main>
  );
}