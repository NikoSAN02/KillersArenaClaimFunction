import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const amount = url.searchParams.get('amount');
  
  if (amount) {
    // Use absolute URL for redirect
    const redirectUrl = `${url.origin}/?amount=${encodeURIComponent(amount)}`;
    return NextResponse.redirect(redirectUrl, 302);
  }
  
  return NextResponse.json({ message: "Claim API GET - add ?amount=123 to test redirect" });
}

export async function POST(request) {
  try {
    const { amount } = await request.json();
    
    if (!amount) {
      return NextResponse.json(
        { error: "Missing amount parameter" },
        { status: 400 }
      );
    }
    
    // Use absolute URL for redirect
    const url = new URL(request.url);
    const redirectUrl = `${url.origin}/?amount=${encodeURIComponent(amount)}`;
    
    return NextResponse.redirect(redirectUrl, 302);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request", message: error.message },
      { status: 400 }
    );
  }
}