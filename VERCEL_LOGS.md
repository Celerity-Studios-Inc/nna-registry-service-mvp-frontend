# Monitoring Vercel Deployment Logs

This guide explains how to access and monitor logs for your Vercel deployment to troubleshoot issues.

## Types of Logs in Vercel

Vercel provides several types of logs for comprehensive monitoring:

1. **Build Logs**: Records of the build process
2. **Runtime Logs**: Logs from your running application
3. **Edge Function Logs**: Logs from Vercel Edge Functions
4. **Serverless Function Logs**: Logs from Vercel Serverless Functions (like our API proxy)
5. **Static Asset Logs**: Requests for static files

## Accessing Deployment Logs

### Method 1: Vercel Dashboard

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the "Deployments" tab
4. Select the deployment you want to inspect
5. Click on "View Logs" or navigate to the "Logs" tab

### Method 2: Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel if needed:
   ```bash
   vercel login
   ```

3. To view deployment logs:
   ```bash
   vercel logs <deployment-url>
   ```

4. To stream logs in real-time:
   ```bash
   vercel logs <deployment-url> --follow
   ```

5. To filter logs by type:
   ```bash
   vercel logs <deployment-url> --lambda  # Serverless function logs
   ```

## Monitoring Serverless Function Logs (API Proxy)

Our API proxy is implemented as a Vercel Serverless Function. To specifically monitor these logs:

### Via Dashboard

1. Go to your deployment in the Vercel Dashboard
2. Click on "Functions" in the top navigation
3. Look for the `/api/proxy` function
4. Click on it to view detailed logs and metrics

### Via CLI

```bash
vercel logs <deployment-url> --lambda /api/proxy
```

## Understanding Common Log Messages

### Build Logs

- **Installing dependencies**: npm/yarn installing packages
- **Build errors**: Compilation or packaging errors
- **Output directory**: Final build output location

### API Proxy Logs

Our API proxy logs specific information:

- **Proxying request**: Shows the request method and target URL
- **Headers**: Request and response headers
- **Status codes**: HTTP status codes from the backend
- **Error messages**: Any issues with the proxy process

## Troubleshooting Using Logs

### CORS Issues

Look for:
- Missing or incorrect Access-Control-Allow-Origin headers
- Failed OPTIONS requests (preflight)
- Response status codes (should be 2xx for success)

### API Connection Issues

Look for:
- Timeout errors when connecting to the backend
- Network errors
- Invalid response formats

### Build Issues

Look for:
- Missing dependencies
- TypeScript compilation errors
- Environment variable problems

## Log Retention and Exporting

Vercel retains logs for a limited time depending on your plan:

- **Hobby**: 1 day
- **Pro**: 7 days
- **Enterprise**: 30+ days

To save logs for longer:

1. In the Vercel Dashboard, navigate to your deployment logs
2. Use the "Download" button to save logs as a text file
3. For CLI, redirect logs to a file:
   ```bash
   vercel logs <deployment-url> > deployment-logs.txt
   ```

## Setting Up Log Alerts

For critical errors, consider setting up alerts:

1. In the Vercel Dashboard, go to your project
2. Navigate to "Settings" > "Notifications"
3. Configure notification preferences for deployment failures
4. Consider integrating with Slack, Discord, or email notifications

## Advanced Logging Tips

### Adding Custom Logs to the API Proxy

The API proxy function in `api/proxy.js` includes `console.log` statements. These appear in the Vercel Function Logs. You can add more logging by modifying this file:

```javascript
// Example of enhanced logging
console.log(`Proxying ${req.method} request to: ${targetUrl} with headers:`, req.headers);
```

### Using Log Levels

When adding custom logs, use different log levels for better filtering:

- `console.log()` for informational messages
- `console.warn()` for warnings
- `console.error()` for errors

### Structured Logging

For better parsing, use structured log formats:

```javascript
console.log(JSON.stringify({
  level: 'info',
  message: 'Proxying request',
  method: req.method,
  url: targetUrl,
  timestamp: new Date().toISOString()
}));
```

## Integrating with External Monitoring

For production deployments, consider integrating with external monitoring services:

1. **Sentry**: For error tracking
2. **LogDNA/Datadog**: For log aggregation
3. **New Relic**: For performance monitoring

These services provide better retention, alerting, and analysis capabilities than Vercel's built-in logging.