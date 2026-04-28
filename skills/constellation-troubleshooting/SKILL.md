---
name: constellation-troubleshooting
description: Use when the user reports Constellation errors, asks to "fix Constellation", "debug Constellation", "Constellation not working", "API connection issues", "indexing problems", "MCP server" issues, "Failed to reconnect", or mentions any Constellation error code (AUTH_ERROR, PROJECT_NOT_INDEXED, MCP_UNAVAILABLE, etc.), or when Constellation tool calls fail. Diagnose the symptom, identify the error code, and provide an actionable fix.
---

# Constellation Troubleshooting

Diagnostic procedures and complete error code reference for Constellation plugin issues.

## Quick Diagnosis Flowchart

```
Issue Reported
     |
     v
Can constellation_code_intel be called?
     |                    |
    YES                   NO
     |                    |
     v                    v
  API Error          MCP Server Issue
 (has code)         (see MCP Diagnosis)
     |
     v
Check error.code:
- AUTH_ERROR --> Authentication section
- PROJECT_NOT_INDEXED --> Indexing section
- SYMBOL_NOT_FOUND --> Query Issues section
- API_UNREACHABLE --> Connectivity section
```

## Error Code Reference

### Connection Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `MCP_UNAVAILABLE` | MCP server not running | stdio server failed to start | Restart OpenCode, check `opencode.json` | No |
| `API_UNREACHABLE` | Cannot reach API | Network error, server down | Check network, verify API URL | Yes |
| `NETWORK_ERROR` | Network failed | DNS, firewall, timeout | Check network connectivity | Yes |

### Authentication Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `AUTH_ERROR` | Authentication failed | Missing/invalid API key | Run `constellation auth` | No |
| `ACCESS_DENIED` | No project access | Key lacks permission | Add access in web UI | No |

### Project Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `PROJECT_NOT_INDEXED` | Project needs indexing | Never indexed | Run `constellation index --full` | Yes* |
| `CONFIG_INVALID` | Config file invalid | JSON syntax error | Fix `constellation.json` | No |
| `CONFIG_MISSING` | No config found | Not initialized | Run `constellation init` | No |

### Query Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `SYMBOL_NOT_FOUND` | Symbol not found | Typo, deleted, not indexed | Try broader search, re-index | Yes |
| `FILE_NOT_FOUND` | File not in index | Wrong path, unsupported type | Check path, verify language config | Yes |
| `VALIDATION_ERROR` | Invalid parameters | Wrong param types | Check API reference | Yes |
| `RATE_LIMITED` | Too many requests | Exceeded rate limit | Wait and retry | Yes |

*Retryable after indexing completes

### Severity Levels

| Severity | Codes | Impact |
|----------|-------|--------|
| Critical | `MCP_UNAVAILABLE`, `API_UNREACHABLE` | All features unavailable |
| High | `AUTH_ERROR`, `ACCESS_DENIED` | Authenticated features blocked |
| Medium | `PROJECT_NOT_INDEXED`, `RATE_LIMITED` | Partial functionality |
| Low | `SYMBOL_NOT_FOUND`, `FILE_NOT_FOUND` | Single query affected |

## Diagnosis Workflow

Based on the user's description, identify:

1. **Most likely error code** from the tables above
2. **Probable cause** based on their symptoms
3. **Recommended fix** with exact commands to run
4. **Verification steps** to confirm the issue is resolved

If the user mentions a specific error code, look it up directly. If they describe symptoms, match to the most likely code.

## MCP Server Issues

**Symptom:** Tool calls to `constellation_code_intel` fail entirely or timeout.

**Cause:** The MCP server isn't starting or is crashing.

**Quick Fixes:**

1. **Restart OpenCode** — MCP connections initialize at startup.

2. **Verify `opencode.json` configuration:**

   ```json
   {
     "mcp": {
       "constellation": {
         "type": "local",
         "command": ["mcp-constellation"],
         "enabled": true,
         "environment": {
           "CONSTELLATION_ACCESS_KEY": "{env:CONSTELLATION_ACCESS_KEY}"
         }
       }
     }
   }
   ```

3. **Check MCP server is installed:** `npx @constellationdev/mcp@latest --version`

## Authentication Issues (AUTH_ERROR)

**Symptom:** "Authentication failed" or "Invalid API key"

**Quick Fixes:**

1. Configure credentials: `npx @constellationdev/cli auth`
2. Check if key is set: `echo $CONSTELLATION_ACCESS_KEY`
3. If key is expired: regenerate in Constellation web UI under Settings > API Keys

## Indexing Issues (PROJECT_NOT_INDEXED)

**Symptom:** "Project not indexed" or empty results

**Quick Fixes:**

1. Index the project:
   ```bash
   cd /path/to/your/project
   constellation index --full
   ```
2. Force reindex if stale:
   ```bash
   constellation index --full --force
   ```

## Connectivity Issues (API_UNREACHABLE)

**Symptom:** Timeout or connection refused

**Quick Fixes:**

1. Check network connectivity
2. Check Constellation status at <https://status.constellationdev.io/>

## Query Issues (SYMBOL_NOT_FOUND, FILE_NOT_FOUND)

These are typically **not errors** — the item simply wasn't found in the index.

**Troubleshooting:**

1. Try partial/broader search terms
2. Check spelling and case sensitivity
3. Verify the file extension is in configured languages
4. Re-index if the file was recently added

## Common Steps Checklist

1. **MCP not working** → Restart OpenCode, verify `opencode.json` has `constellation` MCP configured
2. **Auth failures** → Run `constellation auth` to reconfigure API key
3. **Empty results** → Run `constellation index --full` to reindex the project
4. **Slow queries** → Check if project is large, consider indexing specific directories

## Health Check

For an automated health check that tests MCP connectivity, API authentication, and project indexing in one shot, see the `constellation-diagnose` skill.

See `references/error-codes.md` for the complete error code documentation.
