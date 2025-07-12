// src/metrics-storage.js
import { endpoints } from './config.js';

// Constants for data retention
const RETENTION_DAYS = 60;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000; // 60 days in milliseconds
const MAX_HISTORY_ENTRIES = RETENTION_DAYS * 24 * 60; // 60 days of minute-by-minute data

export class MetricsStorage {
	constructor(state, env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request) {
		const url = new URL(request.url);
		const path = url.pathname;

		if (request.method === 'POST' && path === '/store-metrics') {
			return this.storeMetrics(request);
		} else if (request.method === 'GET' && path === '/get-metrics') {
			return this.getMetrics(request);
		} else if (request.method === 'GET' && path === '/get-status') {
			return this.getCurrentStatus();
		}

		return new Response('Not found', { status: 404 });
	}

	async storeMetrics(request) {
		try {
			const metrics = await request.json();
			const timestamp = Date.now();

			// Store current metrics and update history
			for (const metric of metrics) {
				const key = `current:${metric.endpoint}`;
				const metricData = {
					...metric,
					timestamp,
					date: new Date().toISOString(),
				};

				await this.state.storage.put(key, metricData);

				// Store historical data with retention period
				const historyKey = `history:${metric.endpoint}`;
				let history = (await this.state.storage.get(historyKey)) || [];

				// Add new entry
				history.push(metricData);

				// Remove entries older than retention period
				const cutoffTime = Date.now() - RETENTION_MS;
				const oldEntries = history.filter((entry) => entry.timestamp <= cutoffTime);
				history = history.filter((entry) => entry.timestamp > cutoffTime);

				// Delete old entries from storage
				for (const oldEntry of oldEntries) {
					const oldEntryKey = `entry:${metric.endpoint}:${oldEntry.timestamp}`;
					await this.state.storage.delete(oldEntryKey);
				}

				// Limit total entries to prevent excessive storage
				if (history.length > MAX_HISTORY_ENTRIES) {
					const entriesToRemove = history.slice(0, history.length - MAX_HISTORY_ENTRIES);
					for (const entry of entriesToRemove) {
						const entryKey = `entry:${metric.endpoint}:${entry.timestamp}`;
						await this.state.storage.delete(entryKey);
					}
					history = history.slice(-MAX_HISTORY_ENTRIES);
				}

				await this.state.storage.put(historyKey, history);
			}

			// Cleanup old data periodically (1% chance each time metrics are stored)
			if (Math.random() < 0.01) {
				await this.cleanupOldData();
			}

			return new Response('Metrics stored', { status: 200 });
		} catch (error) {
			return new Response(`Error storing metrics: ${error.message}`, { status: 500 });
		}
	}

	async cleanupOldData() {
		try {
			const cutoffTime = Date.now() - RETENTION_MS;
			const allKeys = await this.state.storage.list();
			const keysToDelete = [];

			for (const key of allKeys) {
				if (key.startsWith('history:')) {
					const history = await this.state.storage.get(key);
					if (Array.isArray(history)) {
						// Find entries older than retention period
						const oldEntries = history.filter((entry) => entry.timestamp <= cutoffTime);
						const newHistory = history.filter((entry) => entry.timestamp > cutoffTime);

						// If we found old entries, update the history and mark entries for deletion
						if (oldEntries.length > 0) {
							await this.state.storage.put(key, newHistory);

							// Add individual entry keys to deletion list
							for (const entry of oldEntries) {
								const endpoint = key.replace('history:', '');
								const entryKey = `entry:${endpoint}:${entry.timestamp}`;
								keysToDelete.push(entryKey);
							}
						}
					}
				} else if (key.startsWith('entry:')) {
					// Check if individual entry is older than retention period
					const timestamp = parseInt(key.split(':')[2]);
					if (timestamp && timestamp <= cutoffTime) {
						keysToDelete.push(key);
					}
				}
			}

			// Delete old entries in batches to avoid overwhelming the storage
			const BATCH_SIZE = 100;
			for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
				const batch = keysToDelete.slice(i, i + BATCH_SIZE);
				await Promise.all(batch.map((key) => this.state.storage.delete(key)));
			}

			console.log(`Cleaned up ${keysToDelete.length} old entries`);
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}

	async getCurrentStatus() {
		try {
			// Get all URLs from config
			const allEndpoints = Object.values(endpoints)
				.flatMap((group) => group.urls)
				.map((endpoint) => endpoint.url);

			const status = {};

			for (const endpoint of allEndpoints) {
				const key = `current:${endpoint}`;
				const current = await this.state.storage.get(key);

				if (current) {
					// Ensure we pass through all data including colo
					status[endpoint] = {
						endpoint: current.endpoint,
						status: current.status,
						latency: current.latency,
						timestamp: current.timestamp,
						date: current.date,
						colo: current.colo, // Make sure colo is included
						statusCode: current.statusCode,
						error: current.error,
					};
				} else {
					status[endpoint] = {
						endpoint,
						status: 'unknown',
						latency: 0,
						timestamp: Date.now(),
						date: new Date().toISOString(),
						colo: 'unknown',
					};
				}
			}

			return new Response(JSON.stringify(status, null, 2), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		} catch (error) {
			return new Response(`Error getting status: ${error.message}`, {
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	}

	async getMetrics(request) {
		try {
			const url = new URL(request.url);
			const endpoint = url.searchParams.get('endpoint');
			const days = parseInt(url.searchParams.get('days')) || 30; // Default to 30 days

			// Limit the maximum days that can be queried to the retention period
			const maxDays = Math.min(days, RETENTION_DAYS);

			if (!endpoint) {
				return new Response('Endpoint parameter required', {
					status: 400,
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				});
			}

			const historyKey = `history:${endpoint}`;
			let history = (await this.state.storage.get(historyKey)) || [];

			// Filter by time range
			const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;
			history = history.filter((entry) => entry.timestamp > cutoff);

			// Calculate statistics
			const upEntries = history.filter((entry) => entry.status === 'up');
			const latencies = upEntries.map((entry) => entry.latency).filter((l) => l > 0);

			// Sort history by timestamp to ensure proper chronological order
			history.sort((a, b) => a.timestamp - b.timestamp);

			const stats = {
				endpoint,
				uptime: history.length > 0 ? (upEntries.length / history.length) * 100 : 0,
				averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
				p90Latency: this.calculatePercentile(latencies, 90),
				totalChecks: history.length,
				upChecks: upEntries.length,
				retentionDays: RETENTION_DAYS,
				history: history, // Return all entries for the time period
			};

			return new Response(JSON.stringify(stats, null, 2), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'public, max-age=60', // Cache for 1 minute
				},
			});
		} catch (error) {
			return new Response(`Error getting metrics: ${error.message}`, {
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	}

	calculatePercentile(arr, percentile) {
		if (arr.length === 0) return 0;

		const sorted = [...arr].sort((a, b) => a - b);
		const index = Math.ceil((percentile / 100) * sorted.length) - 1;
		return sorted[Math.max(0, index)];
	}
}
