import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    return handleProxy(request, params);
}

export async function POST(request, { params }) {
    return handleProxy(request, params);
}

export async function PUT(request, { params }) {
    return handleProxy(request, params);
}

export async function DELETE(request, { params }) {
    return handleProxy(request, params);
}

export async function PATCH(request, { params }) {
    return handleProxy(request, params);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-device-id',
        },
    });
}

async function handleProxy(request, { params }) {
    const pathSegments = params?.path || [];
    const targetPath = pathSegments.join('/');
    const searchParams = request.nextUrl.search || '';

    // Priority list of backend endpoints
    const candidateUrls = [
        process.env.BACKEND_API_URL,
        process.env.NEXT_PUBLIC_BACKEND_URL,
        process.env.NEXT_PUBLIC_API_URL,
        'http://localhost:5000'
    ].filter(Boolean);

    let bodyBytes = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
            bodyBytes = await request.arrayBuffer();
        } catch (e) {
            bodyBytes = null;
        }
    }

    const forwardHeaders = new Headers();
    request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['host', 'connection', 'content-length'].includes(lowerKey)) {
            forwardHeaders.set(key, value);
        }
    });

    let lastError = null;
    let lastResponse = null;

    for (const baseUrl of candidateUrls) {
        let cleanBase = baseUrl.replace(/\/+$/, '');
        if (cleanBase.endsWith('/api')) {
            cleanBase = cleanBase.substring(0, cleanBase.length - 4);
        }

        const candidatePaths = [
            `${cleanBase}/api/${targetPath}${searchParams}`,
            `${cleanBase}/${targetPath}${searchParams}`
        ];

        for (const targetUrl of candidatePaths) {
            try {
                const fetchOptions = {
                    method: request.method,
                    headers: forwardHeaders,
                    redirect: 'manual',
                };

                if (bodyBytes && bodyBytes.byteLength > 0) {
                    fetchOptions.body = bodyBytes;
                }

                const res = await fetch(targetUrl, fetchOptions);

                // If backend responds with non-404 status (200, 401, 400, etc.), return immediately
                if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
                    const responseData = await res.arrayBuffer();
                    const responseHeaders = new Headers();

                    res.headers.forEach((val, key) => {
                        const lowerKey = key.toLowerCase();
                        if (!['content-encoding', 'content-length'].includes(lowerKey)) {
                            responseHeaders.set(key, val);
                        }
                    });

                    return new NextResponse(responseData, {
                        status: res.status,
                        statusText: res.statusText,
                        headers: responseHeaders,
                    });
                }
                lastResponse = res;
            } catch (err) {
                lastError = err;
            }
        }
    }

    // Return last response if available, or structured error response
    if (lastResponse) {
        const data = await lastResponse.arrayBuffer();
        return new NextResponse(data, {
            status: lastResponse.status,
            headers: lastResponse.headers,
        });
    }

    return NextResponse.json(
        { error: 'Backend unreachable. Please verify BACKEND_API_URL in Vercel environment variables.' },
        { status: 502 }
    );
}
