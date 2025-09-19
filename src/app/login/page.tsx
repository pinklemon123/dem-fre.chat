import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <h1>欢迎回到论坛</h1>
        <p>
          在这里结识志同道合的伙伴、分享你的灵感、加入热门派别。无论是技术探讨还是生活闲聊，都能找到属于自己的角落。
        </p>
        <ul>
          <li>使用邮箱或用户名即可快速登录</li>
          <li>一键切换注册，立即创建你的专属身份</li>
          <li>支持移动端访问，随时随地继续讨论</li>
        </ul>
      </section>
      <section className="auth-panel">
        <LoginForm />
      </section>
    </main>
  );
}

