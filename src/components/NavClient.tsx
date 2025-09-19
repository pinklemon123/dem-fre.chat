"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function NavClient({
  links,
  loginHref,
}: {
  links: NavLink[];
  loginHref: string;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState<string>(" ");

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
      <Link href={loginHref} className="login-btn">
        登录
      </Link>
    </nav>
  );
}
