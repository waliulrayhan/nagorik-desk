import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { reportId: string } }
) {
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

    const reportId = parseInt(params.reportId);
    const { status } = await request.json();

    // Validate status
    if (!['RESOLVED', 'UNDER_REVIEW'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
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
    });

    console.log('Updated report status:', updatedReport);
    return NextResponse.json(updatedReport);

  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json(
      { error: 'Failed to update report status' },
      { status: 500 }
    );
  }
} 