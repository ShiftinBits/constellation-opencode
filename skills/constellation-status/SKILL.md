---
name: constellation-status
description: Use when the user asks a quick "is Constellation working", "ping Constellation", "check API connection", or "am I authenticated" question. Lighter than constellation-diagnose — verifies API connectivity and auth only, not indexing.
---

# Constellation Status Check

Check the Constellation API connection and authentication status by calling the `constellation_code_intel` tool with this code:

```javascript
const result = await api.ping();
return result;
```

## Reporting

### On success (`result.pong === true`)

- Status: Connected
- Authentication valid, project access confirmed
- Note: Use the `constellation-diagnose` skill or `api.getCapabilities()` to check indexing status.

### On error (`result.success` is false)

| Error Code | Response |
|------------|----------|
| `AUTH_ERROR` | "Status: Auth Failed — Run `constellation auth` to configure credentials" |
| `PROJECT_NOT_REGISTERED` | "Status: Project Not Found — Verify project ID or check organization access" |
| `PROJECT_INACTIVE` | "Status: Project Inactive — Project has been deactivated" |
| `API_UNREACHABLE` | "Status: API Offline — Check network connectivity and API URL in `constellation.json`" |
| Other codes | Show error code, message, and guidance from `result.error` |
| Missing error object | Note "Unexpected response structure" and show raw result |

### If the tool call fails entirely

- Status: MCP Unreachable
- The Constellation MCP server is not running or not configured
- Suggest: Restart OpenCode, or use the `constellation-diagnose` skill for details

Keep the response brief and actionable.
