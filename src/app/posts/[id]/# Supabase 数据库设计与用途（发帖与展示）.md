# Supabase 数据库设计与用途（发帖与展示）

本项目需要两张核心表，并通过外键建立关系：
- profiles：用户档案（通常与 auth.users 绑定）
- posts：帖子（关联作者 profiles.id）

## 1. 建表与关系

```sql
-- 若尚未启用扩展（用于生成 UUID），Supabase 默认有 uuid，以下为可选：
-- create extension if not exists "pgcrypto";

-- 1) 用户档案表（与 Supabase Auth 绑定）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- 2) 帖子表（与 profiles 关联）
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 建立索引（推荐）
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_author_id on public.posts(author_id);
```

说明：
- posts.author_id → profiles.id 外键关系，允许在查询时 select("..., profiles(...)") 直接取到作者信息，与你现有页面的写法一致。
- profiles.id 建议与 auth.users.id 一致，方便用 auth.uid() 做 RLS 策略。

## 2. 启用 RLS 与策略

```sql
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- 所有人可读用户档案（展示作者昵称）
create policy "profiles_select_all"
on public.profiles for select
using (true);

-- 仅本人可写/改自己的档案（可按需保留）
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- 帖子：所有人可读
create policy "posts_select_all"
on public.posts for select
using (true);

-- 仅已登录用户可发帖，且 author_id 必须等于自己
create policy "posts_insert_owner"
on public.posts for insert
with check (author_id = auth.uid());

--（可选）作者可修改/删除自己的帖子
create policy "posts_update_owner"
on public.posts for update
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "posts_delete_owner"
on public.posts for delete
using (author_id = auth.uid());
```

## 3. 与现有页面的匹配

你的页面通过：
- 表：public.posts
- 选择字段：id, title, content, created_at, profiles(username, email)
- 条件：eq("id", :id).maybeSingle()

这要求：
- posts.author_id → profiles.id 的外键已存在（上面的 DDL 已满足）。
- RLS 允许 select（上面的 posts_select_all 与 profiles_select_all 已满足）。
- URL 中 id 为帖子 UUID（页面已新增 UUID 校验，避免不必要的查询）。

## 4. 是否能实现“发帖 + 展示帖子”

- 展示帖子：已具备。当前详情页通过 id 查询 posts 并联表 profiles，即可显示标题、作者、时间与内容。
- 发帖：满足。登录用户调用 supabase.from("posts").insert({ title, content, author_id: user.id }) 即可创建帖子（受策略保护）。

最小插入示例（客户端/Server Action 二选一）：
```ts
// 伪代码：已登录前提下
const supabase = createClient();
const { data, error } = await supabase.from("posts").insert([{
  title,
  content,
  author_id: (await supabase.auth.getUser()).data.user?.id
}]).select("id");
if (error) throw error;
```

结论：按上述 SQL 配置 Supabase 后，现有代码可以正确展示帖子；并在登录状态下实现安全的“发帖”功能。
string) =>
  /^[
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```


## License: 未知
https://github.com/jw/zink/blob/b1bcce059b85d28547e6b1b52a92c752fdf95211/.yarn/releases/yarn-3.4.1.cjs

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test
```


## License: 未知
https://github.com/tidev/titanium-sdk/blob/76dc1db45175669cd5c59ea1c5d217052a16cc09/tests/Resources/ti.platform.test.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test
```


## License: MIT
https://github.com/signumsoftware/framework/blob/5d38764af97243352629d8363abb65644ce40ac2/Signum.React/Scripts/Finder.tsx

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test
```


## License: MIT
https://github.com/tgriesser/checkit/blob/7938418df789653cf9dcdee9c71ca59074dfba3f/docs/checkit.html

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test
```


## License: 未知
https://github.com/LeshikJanz/nubabi/blob/5b821ba8d6a8940cb9b6c33cabb6099c601559d6/libs/graphql-utils/isOptimistic.js

```
string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test
```

