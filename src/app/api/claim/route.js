import { redirect } from 'next/navigation'

export async function POST(request) {
  const { amount } = await request.json();

  if (!amount) {
    return Response.json(
      { success: false, error: "Missing amount parameter" },
      { status: 400 }
    );
  }

  // Redirect to the claim page with the amount as a query parameter
  redirect(`/?amount=${amount}`);
}