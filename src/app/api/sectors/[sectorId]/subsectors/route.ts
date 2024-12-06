import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { sectorId: string } }
) {
  try {
    if (!params.sectorId) {
      return NextResponse.json(
        { error: 'Sector ID is required' },
        { status: 400 }
      );
    }

    const sectorId = parseInt(params.sectorId);
    
    if (isNaN(sectorId)) {
      return NextResponse.json(
        { error: 'Invalid sector ID' },
        { status: 400 }
      );
    }

    const subsectors = await prisma.subsector.findMany({
      where: {
        sectorId: sectorId
      },
      select: {
        id: true,
        name: true,
        sectorId: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!subsectors) {
      return NextResponse.json(
        { error: 'No subsectors found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subsectors);
  } catch (error) {
    console.error('Error fetching subsectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subsectors' },
      { status: 500 }
    );
  }
} 