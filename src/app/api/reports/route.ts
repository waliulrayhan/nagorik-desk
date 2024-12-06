import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    
    // Extract and validate form data
    const title = formData.get('title') as string;
    const sectorId = parseInt(formData.get('sectorId') as string);
    const subsectorId = parseInt(formData.get('subsectorId') as string);
    const description = formData.get('description') as string;

    // Validate required fields
    if (!title || !sectorId || !subsectorId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        sectorId,
        subsectorId,
        userId: user.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true,
      report 
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
} 