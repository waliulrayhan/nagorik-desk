import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nid = searchParams.get('nid');
    const dob = searchParams.get('dob');

    if (!nid || !dob) {
      return NextResponse.json(
        { message: "NID and Date of Birth are required" },
        { status: 400 }
      );
    }

    // Check if NID exists in verification table
    const nidRecord = await prisma.nidVerification.findUnique({
      where: { nid },
    });

    if (!nidRecord) {
      return NextResponse.json(
        { message: "NID not found in database" },
        { status: 404 }
      );
    }

    // Convert the provided date to match database timestamp format
    const providedDate = new Date(dob);
    providedDate.setUTCHours(0, 0, 0, 0);
    
    // Convert database date to same format for comparison
    const dbDate = new Date(nidRecord.dob);
    dbDate.setUTCHours(0, 0, 0, 0);
    
    if (providedDate.getTime() !== dbDate.getTime()) {
      return NextResponse.json(
        { message: "Date of Birth does not match our records" },
        { status: 400 }
      );
    }

    // Check if NID is already registered
    const existingUser = await prisma.user.findUnique({
      where: { nid },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "This NID is already registered" },
        { status: 400 }
      );
    }

    // Return NID verification data
    return NextResponse.json({
      name: nidRecord.name,
      dob: nidRecord.dob.toISOString().split('T')[0], // Return just the date part
    });

  } catch (error) {
    console.error("NID verification error:", error);
    return NextResponse.json(
      { message: "Error verifying NID" },
      { status: 500 }
    );
  }
} 