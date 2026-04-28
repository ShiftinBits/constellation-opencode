---
name: constellation-unused
description: Use when the user asks to find dead code, orphaned exports, unused functions/classes/types, or "what can I delete". Identifies exported symbols that are never imported anywhere in the codebase. Optionally filter by symbol kind (function, class, type, interface, variable).
---

# Constellation Orphaned / Dead Code Finder

Find exported symbols that are never imported anywhere in the codebase.

## Inputs

- **Kind filter** (optional): one of `function`, `class`, `type`, `interface`, `variable`. If the user does not specify, query without a filter.

## Procedure

Call the `constellation_code_intel` tool. Construct `params` based on whether the user specified a kind:

```javascript
// Set kindFilter to the user's chosen kind, or "" for no filter
const kindFilter = "USER_KIND_OR_EMPTY";
const params = kindFilter ? { filterByKind: [kindFilter] } : {};
const result = await api.findOrphanedCode(params);
return result;
```

## Present (when orphans are found)

1. **Summary**: total count of orphaned exports, broken down by kind (function, class, etc.)
2. **Files with Most Orphans**: group results by file, sorted by count (show top 20)
3. **For Each File**: list the orphaned symbol names, kinds, and line numbers

### Recommendations to include

- Review each orphaned export to confirm it's truly unused
- Some may be entry points or dynamically imported (and therefore false positives)
- Consider removing confirmed dead code to reduce maintenance burden
- Focus on files with multiple orphans first

## When No Orphans Found

Congratulate the user on a clean codebase.

## On Error

Explain the error and surface any guidance from the error response.
