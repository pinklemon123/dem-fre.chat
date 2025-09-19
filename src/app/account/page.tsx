import Link from "next/link";
import NavClient from "../../components/NavClient";
import AccountClient from "../../components/AccountClient";

export default function AccountPage() {
  return (
    <main>
      <header>
        <div className="logo"><Link href="/">论坛Logo</Link></div>
        <NavClient
          links={[
            { href: "/#hot", label: "热帖" },
            { href: "/factions", label: "热门派别" },
            { href: "/ranking", label: "用户排行" },
          ]}
          loginHref="/login"
        />
      </header>
      <section>
        <h2>账号</h2>
        <AccountClient />
      </section>
    </main>
  );
}

