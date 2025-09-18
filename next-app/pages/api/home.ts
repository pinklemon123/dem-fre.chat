import type { NextApiRequest, NextApiResponse } from 'next';
import { hotPosts, factions, ranking } from '@/lib/data';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ hotPosts, factions, ranking });
}

