import { NextResponse } from 'next/server';
 
export async function GET() {
  try {
    // Check API connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiHealth = await fetch(`${apiUrl}/health`).then(res => res.json());

    // Get system info
    const memory = process.memoryUsage();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
      },
      api: apiHealth,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, { status: 500 });
  }
}
