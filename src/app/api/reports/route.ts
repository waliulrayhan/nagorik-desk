import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { summarizeText } from '@/lib/summarize';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData instead of JSON
    const formData = await request.formData();
    console.log('Received FormData:', Object.fromEntries(formData.entries()));

    // Extract data from FormData
    const sectorId = parseInt(formData.get('sectorId') as string);
    const subsectorId = parseInt(formData.get('subsectorId') as string);
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!description || !sectorId || !subsectorId) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        required: ['description', 'sectorId', 'subsectorId'],
        received: { description, sectorId, subsectorId }
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process images if any
    const imageUrls: string[] = [];
    if (images.length > 0) {
      // Here you would typically upload the images to your storage service
      // For now, we'll just log them
      console.log(`Processing ${images.length} images`);
      // TODO: Add your image upload logic here
      // imageUrls = await Promise.all(images.map(image => uploadImage(image)));
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          description: description.trim(),
          userId: user.id,
          sectorId: sectorId,
          subsectorId: subsectorId,
          images: {
            create: imageUrls.map(url => ({
              url: url
            }))
          }
        }
      });

      const sectorReports = await tx.report.findMany({
        where: { sectorId },
        select: { description: true }
      });

      const combinedText = sectorReports
        .map(report => report.description)
        .join('\n\n');

      const summary = await summarizeText(combinedText);

      const existingSummary = await tx.problemSummary.findFirst({
        where: { sectorId }
      });

      if (existingSummary) {
        await tx.problemSummary.update({
          where: { id: existingSummary.id },
          data: {
            summary,
            problems: sectorReports.length
          }
        });
      } else {
        await tx.problemSummary.create({
          data: {
            sectorId,
            summary,
            problems: sectorReports.length
          }
        });
      }

      return report;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating report:', error.message, error.stack);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 