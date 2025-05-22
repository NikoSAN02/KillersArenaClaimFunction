import { NextResponse } from 'next/server';

export async function POST(request) {
  const { amount } = await request.json();

  if (!amount) {
    return NextResponse.json(
      { success: false, error: "Missing amount parameter" },
      { status: 400 }
    );
  }

  // Simply redirect to the claim page
  return NextResponse.redirect(new URL('/', request.url));
}

export async function OPTIONS(request) {
  return NextResponse.json({
    allow: 'POST',
  });
}