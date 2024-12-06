import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const { nid, phone, email, password } = body;

    console.log('Received registration data:', { 
      nid, phone, email, 
      password: password ? '[REDACTED]' : undefined 
    });

    // Validate required fields
    if (!nid || !phone || !email || !password) {
      const missingFields = [];
      if (!nid) missingFields.push('NID');
      if (!phone) missingFields.push('Phone');
      if (!email) missingFields.push('Email');
      if (!password) missingFields.push('Password');

      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify NID exists in verification table
    const nidRecord = await prisma.nidVerification.findUnique({
      where: { nid },
    });

    if (!nidRecord) {
      return NextResponse.json(
        { message: "Invalid NID" },
        { status: 400 }
      );
    }

    // Check if phone or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { email }
        ]
      }
    });

    if (existingUser) {
      const isDuplicatePhone = existingUser.phone === phone;
      const isDuplicateEmail = existingUser.email === email;
      const message = isDuplicatePhone ? 
        "Phone number already registered" : 
        "Email already registered";
      
      return NextResponse.json(
        { message },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        nid,
        phone,
        email,
        password: hashedPassword,
        isRegistered: true,
      },
    });

    console.log('User created successfully:', newUser.id);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? 
      `Error creating user: ${error.message}` : 
      "Error creating user";
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}