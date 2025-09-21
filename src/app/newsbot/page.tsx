import Link from "next/link";
import NavClient from "../../components/NavClient";
import NewsBot from "../../components/NewsBot";
import TaskManager from "../../components/TaskManager";
import SystemMonitor from "../../components/SystemMonitor";

export default function NewsBotPage() {
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
            { href: "/guest", label: "游客体验" },
          ]}
          loginHref="/login"
        />
      </header>
      <section>
        <SystemMonitor />
        <NewsBot />
        <TaskManager />
      </section>
    </main>
  );
}