---
name: constellation-deps
description: Use when the user asks to analyze dependencies for a file or symbol, find what a file imports, find what depends on a file (reverse dependencies / dependents), or detect circular imports. Supports both forward (what X uses) and reverse (what uses X) analysis.
---

# Constellation Dependency Analysis

Analyze dependencies for a specified file using Constellation.

## Inputs

- **File path** (required): the target file to analyze. If the user did not provide one, ask which file they want to analyze.
- **Direction** (optional): default is forward (what this file depends on). Reverse mode (what depends on this file) applies when the user says "reverse", "dependents", "what uses", "what imports", etc.

## Forward Dependencies (default)

Call the `constellation_code_intel` tool with this code (substitute the actual file path):

```javascript
const [deps, circles] = await Promise.all([
  api.getDependencies({ filePath: "FILE_PATH_HERE", depth: 2, includePackages: true }),
  api.findCircularDependencies({ filePath: "FILE_PATH_HERE", maxDepth: 5 })
]);
return { dependencies: deps, circularDependencies: circles };
```

Present:

1. **Summary**: count of internal vs external dependencies
2. **Internal Dependencies**: each file and what symbols are imported from it
3. **External Packages**: list of npm packages used
4. **Circular Dependencies**: if any cycles detected, show severity and the cycle path

## Reverse Dependencies (dependents)

Call the `constellation_code_intel` tool with this code:

```javascript
const result = await api.getDependents({ filePath: "FILE_PATH_HERE", depth: 2 });
return result;
```

Present:

1. **Summary**: how many files depend on this one
2. **Dependents**: each file and what it imports from this file
3. **Note**: suggest reviewing these files if planning changes

Highlight any circular dependencies as potential issues to address.
