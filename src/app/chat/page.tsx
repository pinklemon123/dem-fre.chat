import Link from "next/link";
import NavClient from "../../components/NavClient";
import ChatClient from "../../components/ChatClient";

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
            { href: "/newsbot", label: "新闻机器人" },
            { href: "/chat", label: "聊天对话" },
            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>

      <section>
        <h2>💬 聊天对话</h2>
        <p>与其他用户聊天或与AI助手对话</p>
        <ChatClient />
      </section>
    </main>
  );
}