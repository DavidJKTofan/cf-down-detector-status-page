// src/health-checker.js
import { endpoints } from './config.js';

export class HealthChecker {
	constructor(env) {
		this.env = env;
		this.endpoints = Object.values(endpoints)
			.flatMap((group) => group.urls)
			.map((endpoint) => endpoint.url);
	}

	async checkAllEndpoints() {
		console.log('Starting health checks...');

		// Get Cloudflare colo information
		const coloInfo = await this.getColoInfo();

		const results = await Promise.allSettled(this.endpoints.map((endpoint) => this.checkEndpoint(endpoint)));

		const metrics = results.map((result, index) => {
			if (result.status === 'fulfilled') {
				return {
					...result.value,
					colo: coloInfo.colo,
				};
			} else {
				return {
					endpoint: this.endpoints[index],
					status: 'down',
					latency: 0,
					error: result.reason?.message || 'Unknown error',
					colo: coloInfo.colo,
				};
			}
		});

		// Store metrics in Durable Object
		await this.storeMetrics(metrics);

		console.log('Health checks completed:', metrics);
		return metrics;
	}

	async getColoInfo() {
    try {
      // Fetch Cloudflare colo information
      const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
      const text = await response.text();
      const data = text.split('\n').reduce((obj, line) => {
        const [key, value] = line.split('=');
        if (key) obj[key] = value;
        return obj;
      }, {});

      return {
        colo: data.colo || 'unknown'
      };
    } catch (error) {
      console.error('Error getting colo information:', error);
      return { colo: 'unknown' };
    }
  }

	async checkEndpoint(endpoint) {
		const startTime = Date.now();

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

			const response = await fetch(endpoint, {
				method: 'HEAD', // Use HEAD request to minimize data transfer
				signal: controller.signal,
				headers: {
					'User-Agent': 'StatusChecker/1.0 (Cloudflare Worker)',
					Accept: '*/*',
				},
				redirect: 'follow', // Follow redirects
			});

			clearTimeout(timeoutId);
			const endTime = Date.now();
			const latency = endTime - startTime;

			// Consider redirects as success
			const isSuccess = response.ok || (response.status >= 300 && response.status < 400);

			return {
				endpoint,
				status: isSuccess ? 'up' : 'down',
				statusCode: response.status,
				latency,
				error: isSuccess ? null : `HTTP ${response.status}`,
				method: 'HEAD',
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			const endTime = Date.now();
			const latency = endTime - startTime;

			let status = 'down';
			let errorMessage = error.message;

			if (error.name === 'AbortError') {
				errorMessage = 'Request timeout (10s)';
			}

			return {
				endpoint,
				status,
				latency: 0, // Don't count failed request latency
				error: errorMessage,
				method: 'HEAD',
				timestamp: new Date().toISOString(),
			};
		}
	}

	async storeMetrics(metrics) {
		try {
			// Get Durable Object instance
			const id = this.env.METRICS_STORAGE.idFromName('global');
			const obj = this.env.METRICS_STORAGE.get(id);

			const response = await obj.fetch('http://0.0.0.0/store-metrics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(metrics),
			});

			if (!response.ok) {
				throw new Error(`Failed to store metrics: ${response.status}`);
			}
		} catch (error) {
			console.error('Error storing metrics:', error);
			throw error;
		}
	}
}
