import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const amount = url.searchParams.get('amount');
  
  if (amount) {
    const redirectUrl = new URL('/', url.origin);
    redirectUrl.searchParams.set('amount', amount);
    return NextResponse.redirect(redirectUrl.toString());
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
    
    const url = new URL(request.url);
    const redirectUrl = new URL('/', url.origin);
    redirectUrl.searchParams.set('amount', amount);
    
    return NextResponse.redirect(redirectUrl.toString());
    
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request", message: error.message },
      { status: 400 }
    );
  }
}