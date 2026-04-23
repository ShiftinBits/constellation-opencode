---
description: Check Constellation API connectivity and authentication status
model: anthropic/claude-haiku-4-5-20251001
---

Check the Constellation API connection status by calling the `constellation_code_intel` tool with this code parameter:

```javascript
const result = await api.ping();
return result;
```

**If successful** (result.pong === true), report:
- Status: Connected
- Authentication valid, project access confirmed
- Note: Use `/diagnose` or `api.getCapabilities()` to check indexing status

**If error** (result.success is false), report based on error code:

| Error Code | Response |
|------------|----------|
| `AUTH_ERROR` | "Status: Auth Failed - Run `constellation auth` to configure credentials" |
| `PROJECT_NOT_REGISTERED` | "Status: Project Not Found - Verify project ID or check organization access" |
| `PROJECT_INACTIVE` | "Status: Project Inactive - Project has been deactivated" |
| `API_UNREACHABLE` | "Status: API Offline - Check network connectivity and API URL in constellation.json" |
| Other codes | Show error code, message, and guidance from result.error |
| Missing error object | Note "Unexpected response structure" and show raw result |

**If the tool call fails entirely**, report:
- Status: MCP Unreachable
- The Constellation MCP server is not running or not configured
- Suggest: Restart OpenCode or run `/diagnose` for details

Keep the response brief and actionable.
