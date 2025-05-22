export async function GET() {
  return Response.json({ message: 'Test API works', timestamp: new Date().toISOString() });
}