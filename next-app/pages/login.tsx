import Layout from '@/components/Layout';

export default function LoginPage() {
  return (
    <Layout title="用户登录">
      <div className="login-container">
        <h2>用户登录</h2>
        <form id="login-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="邮箱或手机号" required />
          <input type="password" placeholder="密码" required />
          <button type="submit">登录</button>
        </form>
        <p className="login-tip">未注册？请联系管理员或使用手机App注册。</p>
      </div>
    </Layout>
  );
}

