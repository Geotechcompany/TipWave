import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, ['DJ']))) return;

  if (req.method === 'GET') {
    const queue = await prisma.songRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { bidAmount: 'desc' },
    });
    res.status(200).json(queue);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}