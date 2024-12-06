import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log('User found:', user?.role);

    if (!user || user.role !== 'SECTOR_ADMIN') {
      console.log('User not authorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const problemSummaries = await prisma.problemSummary.findMany({
      select: {
        id: true,
        summary: true,
        problems: true,
        createdAt: true,
        sector: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found problem summaries:', problemSummaries);
    return NextResponse.json(problemSummaries);

  } catch (error) {
    console.error('Error fetching problem summaries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 