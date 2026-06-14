import { NextResponse } from 'next/server';
import { getMoySkladAuthHeaders } from '@/lib/moysklad';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const href = searchParams.get('href');

    if (!href) {
      return new NextResponse('Missing href', { status: 400 });
    }

    // Only allow proxying moysklad urls
    if (!href.startsWith('https://api.moysklad.ru/')) {
      return new NextResponse('Invalid href', { status: 400 });
    }

    const headers = getMoySkladAuthHeaders();

    const response = await fetch(href, {
      headers,
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
