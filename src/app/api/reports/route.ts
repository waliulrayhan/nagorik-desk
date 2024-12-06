import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    
    // Extract and validate form data (remove title)
    const sectorId = parseInt(formData.get('sectorId') as string);
    const subsectorId = parseInt(formData.get('subsectorId') as string);
    const description = formData.get('description') as string;
    const imageFiles = formData.getAll('images') as File[];

    // Validate required fields (remove title validation)
    if (!sectorId || !subsectorId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle image uploads
    const imageUrls: string[] = [];
    
    for (const file of imageFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const imageUrl = `data:${file.type};base64,${base64String}`;
      imageUrls.push(imageUrl);
    }

    // Create the report with null title
    const report = await prisma.report.create({
      data: {
        title: null, // Set title to null
        description,
        sectorId,
        subsectorId,
        userId: user.id,
        status: 'PENDING',
        images: {
          create: imageUrls.map(url => ({
            url
          }))
        }
      },
      include: {
        images: true
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