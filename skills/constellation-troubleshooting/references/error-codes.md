# Constellation Error Codes Reference

## Connection Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `MCP_UNAVAILABLE` | MCP server not running | stdio server failed to start | Restart OpenCode, check opencode.json | No |
| `API_UNREACHABLE` | Cannot reach API | Network error, server down | Check network, verify API URL | Yes |
| `NETWORK_ERROR` | Network failed | DNS, firewall, timeout | Check network connectivity | Yes |

## Authentication Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `AUTH_ERROR` | Authentication failed | Missing/invalid API key | Run `constellation auth` | No |
| `ACCESS_DENIED` | No project access | Key lacks permission | Add access in web UI | No |

## Project Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `PROJECT_NOT_INDEXED` | Project needs indexing | Never indexed | Run `constellation index --full` | Yes* |
| `CONFIG_INVALID` | Config file invalid | JSON syntax error | Fix constellation.json | No |
| `CONFIG_MISSING` | No config found | Not initialized | Run `constellation init` | No |

## Query Errors

| Code | Message | Cause | Fix | Retryable |
|------|---------|-------|-----|-----------|
| `SYMBOL_NOT_FOUND` | Symbol not found | Typo, deleted, not indexed | Try broader search, re-index | Yes |
| `FILE_NOT_FOUND` | File not in index | Wrong path, unsupported type | Check path, verify language config | Yes |
| `VALIDATION_ERROR` | Invalid parameters | Wrong param types | Check API reference | Yes |
| `RATE_LIMITED` | Too many requests | Exceeded rate limit | Wait and retry | Yes |

*Retryable after indexing completes

## Error Response Structure

All Constellation API responses follow this structure:

```typescript
interface ConstellationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;      // Error code from table above
    message: string;   // Human-readable message
    guidance?: string; // Suggested fix
    retryable?: boolean;
    retryAfter?: number; // Seconds (for rate limiting)
  };
}
```

## Severity Levels

| Severity | Codes | Impact |
|----------|-------|--------|
| Critical | MCP_UNAVAILABLE, API_UNREACHABLE | All features unavailable |
| High | AUTH_ERROR, ACCESS_DENIED | Authenticated features blocked |
| Medium | PROJECT_NOT_INDEXED, RATE_LIMITED | Partial functionality |
| Low | SYMBOL_NOT_FOUND, FILE_NOT_FOUND | Single query affected |
