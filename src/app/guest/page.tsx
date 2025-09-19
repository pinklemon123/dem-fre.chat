import Link from "next/link";
import NavClient from "../../components/NavClient";
import GuestExperience from "../../components/GuestExperience";

export default function GuestPage() {
  return (
    <main>

        <div className="logo"><Link href="/">论坛Logo</Link></div>
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
        <GuestExperience />
      </section>
    </main>
  );
}

