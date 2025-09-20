```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchPost } from "@/lib/fetchPost";
import { formatPostAuthor } from "@/lib/formatPostAuthor";

export const revalidate = 0;

// 新增：基础 UUID 校验（若你的 id 不是 UUID，可按需调整）
const isValidId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// ...existing code...

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  // 新增：无效 id 直接 404，避免无谓的数据库查询
  if (!isValidId(params.id)) {
    notFound();
    return null;
  }
  // ...existing code...
}

// ...existing code...

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // 新增：无效 id 的元数据
  if (!isValidId(params.id)) {
    return { title: "帖子不存在 - 论坛社区" };
  }

  const post = await fetchPost(params.id);
  if (!post) {
    return { title: "帖子不存在 - 论坛社区" };
  }

  // 优化：更干净的预览文案
  const author = formatPostAuthor(post);
  const clean = post.content.replace(/\s+/g, " ").trim();
  const preview = clean.length > 80 ? `${clean.slice(0, 80)}...` : clean;

  return {
    title: `${post.title} - 论坛社区`,
    description: `${author} · ${preview}`,
    openGraph: {
      title: `${post.title} - 论坛社区`,
      description: `${author} · ${preview}`,
    },
    twitter: {
      card: "summary",
      title: `${post.title} - 论坛社区`,
      description: `${author} · ${preview}`,
    },
  };
}
```