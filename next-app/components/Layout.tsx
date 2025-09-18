import Head from 'next/head';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function Layout({ children, title }: PropsWithChildren<{ title?: string }>) {
  const pageTitle = title ? `${title}` : '论坛首页';
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="论坛网站示例 - Next.js 迁移" />
      </Head>
      <header>
        <div className="logo">论坛Logo</div>
        <nav>
          <a href="#hot">热帖</a>
          <a href="#factions">热门派别</a>
          <a href="#ranking">用户排行榜</a>
          <Link href="/login" className="login-btn">登录</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          © 2025 论坛网站 | 设计参考{' '}
          <a href="https://www.wyzxwk.com/" target="_blank" rel="noreferrer">乌有之乡</a>
        </p>
      </footer>
    </>
  );
}

