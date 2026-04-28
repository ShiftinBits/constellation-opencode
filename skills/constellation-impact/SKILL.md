---
name: constellation-impact
description: Use BEFORE renaming, deleting, or significantly modifying a function, class, or other symbol — and whenever the user asks "what would break if I change X", "blast radius", "is it safe to modify X", or "impact of changing X". Produces a risk assessment with affected files and dependents.
---

# Constellation Impact Analysis

Analyze the impact of changing a specified symbol using Constellation.

## Inputs

- **Symbol name** (required): the symbol the user wants to analyze. If not provided, ask the user.
- **File path** (optional): helps disambiguate when a symbol name appears in multiple files.

## Procedure

Call the `constellation_code_intel` tool with this code (substitute actual values for `symbolName` and `filePath`; pass `filePath: undefined` if the user did not specify one):

```javascript
const result = await api.impactAnalysis({
  symbolName: "SYMBOL_NAME_HERE",
  filePath: "FILE_PATH_HERE_OR_UNDEFINED",
  depth: 3
});
return result;
```

## Present (on success)

1. **Symbol**: name, kind (function/class/etc), and location
2. **Risk Assessment**: risk level (low/medium/high/critical) and score
3. **Impact Scope**: number of files and symbols affected, whether it's a public API
4. **Direct Dependents**: top 10 files that directly depend on this symbol
5. **Test Coverage**: percentage from `result.data.breakdown.testCoverage`
6. **Recommendations**: from `result.data.recommendations`

If risk is **high or critical**, emphasize caution and suggest reviewing dependents before making changes.

## On Error

Explain the error and surface any guidance from the error response.
