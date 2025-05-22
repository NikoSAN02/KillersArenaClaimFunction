import { NextResponse } from 'next/server';

export async function GET(request) {
  // Simply redirect to the claim page
  return NextResponse.redirect(new URL('/', request.url));
}

export async function OPTIONS(request) {
  return NextResponse.json({
    allow: ['GET'],
  });
}