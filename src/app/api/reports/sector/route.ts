import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'SECTOR_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching reports for sector admin:', user.email);

    const reports = await prisma.report.findMany({
      where: {
        status: {
          in: ['PENDING', 'UNDER_REVIEW'],
        },
      },
      include: {
        user: {
          select: {
            email: true,
            nid: true,
            phone: true,
          },
        },
        sector: {
          select: {
            name: true,
          },
        },
        subsector: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found reports:', reports.length);

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error in sector reports API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 