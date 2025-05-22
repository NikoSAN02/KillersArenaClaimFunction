export async function GET() {
  // In a real app, this would fetch from contract or database
  // For now returning a fixed amount
  return Response.json({ 
    amount: "100" // Fixed claim amount
  });
}