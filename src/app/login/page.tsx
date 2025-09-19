export default function LoginPage() {
  return (
    <main>
      <div className="login-container">
        <h2>用户登录</h2>
        <form id="login-form">
          <input type="text" placeholder="邮箱或手机号" required />
          <input type="password" placeholder="密码" required />
          <button type="submit">登录</button>
        </form>
        <p className="login-tip">未注册？请联系管理员或使用手机 App 注册。</p>
      </div>
    </main>
  );
}
