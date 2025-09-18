export type Card = { title: string; meta: string; content: string };

export const hotPosts: Card[] = [
  { title: '如何提升论坛活跃度？', meta: '作者：小明 | 2025-09-18', content: '大家有什么建议？欢迎讨论！' },
  { title: '本月热门话题：AI与社会', meta: '作者：AI达人 | 2025-09-17', content: 'AI技术对社会的影响，你怎么看？' },
  { title: '新用户积分规则说明', meta: '作者：管理员 | 2025-09-16', content: '积分如何获取与排名，详细说明。' },
];

export const factions: Card[] = [
  { title: '技术派', meta: '成员：1200人', content: '专注技术交流与分享。' },
  { title: '生活派', meta: '成员：800人', content: '关注生活、情感、成长。' },
  { title: 'AI先锋', meta: '成员：500人', content: 'AI相关话题讨论。' },
];

export const ranking: Card[] = [
  { title: '小明', meta: '积分：9800', content: '本月发帖最多。' },
  { title: 'AI达人', meta: '积分：8700', content: '热帖贡献者。' },
  { title: '管理员', meta: '积分：8000', content: '论坛维护。' },
];

