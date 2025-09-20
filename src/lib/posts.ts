export type Profile = { username: string | null; email: string | null };

export type ProfileRelation = Profile | Profile[] | null;

export type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: ProfileRelation;
};

export type Post = Omit<PostRow, "profiles"> & { profiles: Profile | null };

export function normalizeProfileRelation(relation: ProfileRelation): Profile | null {
  if (!relation) return null;
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }
  return relation;
}

export function normalizePostRow(row: PostRow | null): Post | null {
  if (!row) return null;
  return {
    ...row,
    profiles: normalizeProfileRelation(row.profiles),
  };
}

export function normalizePostRows(rows: PostRow[] | null | undefined): Post[] {
  if (!rows) return [];
  return rows.map((row) => ({
    ...row,
    profiles: normalizeProfileRelation(row.profiles),
  }));
}

export function formatPostAuthor(post: Pick<Post, "profiles">): string {
  const username = post.profiles?.username ?? null;
  if (username) return username;
  const email = post.profiles?.email ?? null;
  if (email) {
    const [localPart] = email.split("@");
    if (localPart) {
      return localPart;
    }
  }
  return "匿名用户";
}
