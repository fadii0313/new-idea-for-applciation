import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const targetPath = params.path.join('/');
  const query = request.nextUrl.search;
  const targetUrl = `${API_GATEWAY_URL}/api/${targetPath}${query}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Proxy fetch error: ${err.message}` },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const targetPath = params.path.join('/');
  const targetUrl = `${API_GATEWAY_URL}/api/${targetPath}`;

  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.text();
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      body,
      headers: contentType.includes('application/json')
        ? { 'Content-Type': 'application/json' }
        : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Proxy dispatch error: ${err.message}` },
      { status: 502 }
    );
  }
}
