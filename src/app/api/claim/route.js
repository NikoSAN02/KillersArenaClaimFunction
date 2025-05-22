import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Claim API GET works" });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: "Claim API POST works",
      received: body
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Invalid JSON",
      message: error.message 
    }, { status: 400 });
  }
}