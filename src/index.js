// src/index.js
import { HealthChecker } from './health-checker.js';
import { endpoints } from './config.js';
export { MetricsStorage } from './metrics-storage.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // API routes
        if (url.pathname.startsWith('/api/')) {
            const apiResponse = await handleApi(request, env, url);
            // Add CORS headers to the response
            const headers = new Headers(apiResponse.headers);
            headers.set('Access-Control-Allow-Origin', '*');
            
            return new Response(apiResponse.body, {
                status: apiResponse.status,
                headers
            });
        }

        // Serve frontend
        return serveHtml(request, env);
    },

    async scheduled(event, env, ctx) {
        const checker = new HealthChecker(env);
        await checker.checkAllEndpoints();
    },
};

async function handleApi(request, env, url) {
    const path = url.pathname.replace('/api', '');

    // Get Durable Object instance
    const id = env.METRICS_STORAGE.idFromName('global');
    const obj = env.METRICS_STORAGE.get(id);

    if (path === '/status') {
        return obj.fetch(new Request(new URL('/get-status', request.url), {
            method: 'GET'
        }));
    } else if (path === '/metrics') {
        // Forward the request with the query parameters
        return obj.fetch(new Request(new URL(`/get-metrics?${url.searchParams.toString()}`, request.url), {
            method: 'GET'
        }));
    } else if (path === '/config') {
        return new Response(JSON.stringify(endpoints, null, 2), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return new Response('Not found', { status: 404 });
}

async function serveHtml(request, env) {
    // If ASSETS binding is available (production), use it
    if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        return new Response(response.body, {
            headers: {
                ...response.headers,
                'Content-Type': 'text/html;charset=UTF-8',
            },
        });
    }

    // In development, serve the file directly
    try {
        const response = await fetch('http://localhost:8787/public/index.html');
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
            },
        });
    } catch (error) {
        console.error('Error serving HTML:', error);
        return Response.redirect('/', 307);
    }
}
