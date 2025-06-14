# Service Status Dashboard

A real-time service monitoring dashboard built with Cloudflare Workers and Durable Objects. Monitor the health and response times of various cloud services and security platforms including Cloudflare, Zscaler, Netskope, and more.

## 🏗️ Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript with Chart.js, deployed via Cloudflare Workers [Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- **Backend**: [Cloudflare Workers](https://developers.cloudflare.com/workers/) for API endpoints
- **Storage**: [Durable Objects](https://developers.cloudflare.com/durable-objects/) for persistent metrics storage
- **Scheduling**: Cloudflare Workers [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for automated checks

## 🔌 API Endpoints

### GET `/api/status`

Returns the current status of all monitored services.

```bash
curl "https://downdetector.automatic-demo.com/api/status"
```

**Status Values:**

- `up`: Service is responding with HTTP 2xx/3xx
- `down`: Service failed to respond or returned error status
- `unknown`: No recent data available

### GET `/api/metrics?endpoint={url}`

Returns detailed metrics and historical data for a specific endpoint.

```bash
curl "https://downdetector.automatic-demo.com/api/metrics?endpoint=https%3A//manage.fastly.com/&days=7"
```

**Query Parameters:**

- `endpoint` (required): URL-encoded endpoint URL
- `days` (optional): Number of days of history to return (default: 1, max: 60)

### GET `/api/config`

Returns the service configuration including all monitored endpoints grouped by provider.

```bash
curl "https://downdetector.automatic-demo.com/api/config"
```

---

## 🔧 Testing Methodology

- **Test Frequency**: Every 5 minutes using Cloudflare Workers cron triggers
- **Test Method**: HTTP HEAD requests with 10-second timeout
- **Test Location**: Cloudflare's global edge network (colo reported in metrics)
- **Data Retention**: 60 days of historical data
- **Status Determination**: HTTP 2xx/3xx responses = UP, all others = DOWN
- **Timeout Handling**: Requests exceeding 10 seconds are marked as DOWN

## 🔗 Sharing

Each service has a share button (🔗) that generates a direct link to view that specific service's metrics. The URL format is:

```
https://downdetector.automatic-demo.com/?endpoint=https%3A%2F%2Fone.dash.cloudflare.com%2F
```

---

## 🛠️ Customization

### Adding New Services

Edit [src/config.js](src/config.js) to add new endpoints:

```javascript
export const endpoints = {
	myservice: {
		name: 'My Service',
		urls: [
			{
				url: 'https://api.myservice.com/health',
				description: 'My Service API',
			},
		],
	},
};
```

### Adjusting Check Frequency

Modify the cron trigger in `wrangler.toml`:

```jsonc
"triggers": {
		"crons": ["*/5 * * * *"]
	},
```

## 📝 Disclaimer

This project is for educational purposes.
