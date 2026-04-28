---
name: constellation-architecture
description: Use when the user asks for a high-level overview of the codebase architecture, project structure, language distribution, symbol breakdown, key directories, or "what does this codebase look like overall". Produces a concise architectural summary by querying Constellation.
---

# Constellation Architecture Overview

Retrieve a high-level architectural overview of the codebase using Constellation.

## Procedure

Call the `constellation_code_intel` tool with this code:

```javascript
const result = await api.getArchitectureOverview({ includeMetrics: true, includeModuleGraph: false });
return result;
```

## Present the Following

1. **Project Summary**
   - Project name
   - Total files and total symbols
   - Supported languages

2. **Language Distribution**
   - For each language in `result.data.metrics.byLanguage`:
     - Language name
     - File count
     - Symbol count
     - Percentage of codebase

3. **Symbol Breakdown**
   - Top 10 symbol kinds from `result.data.metrics.byKind` (functions, classes, interfaces, etc.)
   - Show count for each

4. **Key Directories**
   - Top 10 directories by symbol count from `result.data.structure`
   - These represent the main modules/areas of the codebase

5. **Observations** (optional insights)
   - Note if it's heavily function-based vs class-based
   - Multi-language codebase characteristics
   - Relative size of different areas

Keep the output concise and scannable. Focus on giving a quick mental model of the codebase structure.
