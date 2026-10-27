export async function GET(){return Response.json({configured:!!process.env.PGA_API_KEY},{headers:{'Cache-Control':'no-store'}})}
