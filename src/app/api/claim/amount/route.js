import { NextResponse } from 'next/server';

export async function POST(request) {
  const { amount } = await request.json();
  
  if (!amount) {
    return NextResponse.json(
      { success: false, error: "Missing amount parameter" },
      { status: 400 }
    );
  }
  
  // Get the base URL and construct the redirect properly
  const url = new URL(request.url);
  const redirectUrl = new URL('/', url.origin);
  
  // Optionally pass the amount as a query parameter to your claim page
  redirectUrl.searchParams.set('amount', amount);
  
  return NextResponse.redirect(redirectUrl.toString());
}

export async function GET(request) {
  // Also handle GET requests in case the external source uses GET
  const url = new URL(request.url);
  const amount = url.searchParams.get('amount');
  
  if (!amount) {
    return NextResponse.json(
      { success: false, error: "Missing amount parameter" },
      { status: 400 }
    );
  }
  
  const redirectUrl = new URL('/', url.origin);
  redirectUrl.searchParams.set('amount', amount);
  
  return NextResponse.redirect(redirectUrl.toString());
}

export async function OPTIONS(request) {
  return NextResponse.json({
    allow: ['GET', 'POST'],
  });
}