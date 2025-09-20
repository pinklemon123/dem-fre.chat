"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "../lib/supabase/client";

type NavLink = { href: string; label: string };

export default function NavClient({
  links,
  loginHref,
}: {
  links: NavLink[];
  loginHref: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState<string>(" ");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return getBrowserSupabaseClient();
    } catch (error) {
      console.error("Supabase client unavailable", error);
      return null;
    }
  }, []);

  const hashIds = useMemo(
    () =>
      links
        .map((l) => (l.href.startsWith("#") ? l.href.slice(1) : null))
        .filter(Boolean) as string[],
    [links]
  );

  useEffect(() => {
    const setFromLocation = () => {
      const h = typeof window !== "undefined" ? window.location.hash : "";
      setActive(h || pathname);
    };

    setFromLocation();

    const onHashChange = () => setFromLocation();

    let io: IntersectionObserver | null = null;
    const sections = hashIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length) {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]) setActive(`#${visible[0].target.id}`);
        },
        { rootMargin: "-10% 0px -70% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.8] }
      );
      sections.forEach((sec) => io!.observe(sec));
    }

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      if (io) io.disconnect();
    };
  }, [pathname, hashIds]);

  useEffect(() => {
    if (!supabase) {
      setClientError("Supabase 未配置");
      setLoading(false);
      return;
    }

    let mounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    };

    syncUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href.startsWith("#")) return active === href;
    return active === pathname && href === pathname;
  };

  return (
    <nav>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={isActive(l.href) ? "active" : undefined}
        >
          {l.label}
        </Link>
      ))}
      {clientError ? null : loading ? null : user ? (
        <div className="nav-auth">
          <Link href="/posts/new" className="primary">发帖</Link>
          <Link href="/me" className="ghost">我的</Link>
          <button type="button" onClick={signOut} className="ghost">退出</button>
        </div>
      ) : (
        <Link href={loginHref} className="login-btn">
          登录
        </Link>
      )}
    </nav>
  );
}
