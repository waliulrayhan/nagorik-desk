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

    if (!user || user.role !== 'GOVT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sectors
    const sectors = await prisma.sector.findMany();

    // Generate trend data for each sector
    const trends = await Promise.all(
      sectors.map(async (sector) => {
        // Get last 6 months of data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const reports = await prisma.report.groupBy({
          by: ['createdAt'],
          where: {
            sectorId: sector.id,
            createdAt: {
              gte: sixMonthsAgo,
            },
          },
          _count: true,
        });

        // Format the data for the chart
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            count: 0,
          };
        }).reverse();

        return {
          sectorId: sector.id,
          sectorName: sector.name,
          data: monthlyData.map(m => m.count),
          labels: monthlyData.map(m => m.month),
        };
      })
    );

    return NextResponse.json(trends);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 