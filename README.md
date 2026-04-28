# <img src="https://constellationdev.io/opencode-icon.svg" height="30"> Constellation Plugin for OpenCode

[![NPM Version](https://img.shields.io/npm/v/@constellationdev/opencode?logo=npm&logoColor=white)](https://www.npmjs.com/package/@constellationdev/opencode) [![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-3DA639?logo=opensourceinitiative&logoColor=white)](LICENSE)

While Constellation's MCP server provides raw code intelligence capabilities, this plugin enhances your OpenCode experience with:

| Feature | Benefit |
|---------|---------|
| **Specialized Agents** | AI agents for codebase exploration, impact analysis, and dependency health |
| **Session Hooks** | Automatic Constellation availability checks and context preservation |

## Features

### Agents

Specialized AI agents for autonomous analysis:

| Agent | Purpose |
|-------|---------|
| **@source-scout** | Explores and navigates codebase, discovers symbols and architectural patterns |
| **@impact-investigator** | Proactively assesses risk before refactoring, renaming, or deleting code |
| **@dependency-detective** | Detects circular dependencies and unhealthy coupling patterns |

**Example Trigger:**
```
You: "What does this codebase do?"
OpenCode: [Activates @source-scout agent]

You: "I'm renaming AuthService to AuthenticationService"
OpenCode: "Before renaming, let me analyze the potential impact..."
[Activates @impact-investigator agent]
```

### Hooks

Event hooks enable intelligent, transparent assistance:

| Hook | Event | Behavior |
|------|-------|----------|
| **Availability Check** | `session.created` | Silently checks Constellation connectivity at session start |
| **System Prompt Enhancement** | `chat.system.transform` | Injects Constellation priority into prompts |
| **Context Preservation** | `session.compacting` | Preserves Constellation insights in compacted summary |

## Installation

### Prerequisites

1. **Constellation Account** (see [Constellation](https://app.constellationdev.io))
2. **Project indexed** in Constellation
3. **Access key** configured

### Automatic Setup (Recommended)

When you run `constellation init` with OpenCode tool configuration, the CLI automatically configures both the plugin and MCP server in your project's `opencode.json`.

### Manual Setup

Add the plugin to your project's `opencode.json`:

```json
{
  "plugin": ["@constellationdev/opencode"]
}
```

OpenCode will automatically install the plugin at startup.

> **Note:** Install this plugin at the project level, not globally. It should only be enabled for projects that use Constellation.

## Usage Examples

The plugin ships a set of on-demand **skills** — OpenCode's agent loads them automatically when a user request matches the skill's description. There are no slash commands; just ask.

### Check Your Setup

```
> Check Constellation status

[skill: constellation-status]
Status: Connected
Project: my-awesome-app
Files Indexed: 1,247
Symbols: 8,932
Languages: TypeScript, JavaScript
```

### Analyze Before Refactoring

```
> What's the impact of changing validateUser in src/auth/validator.ts?

[skill: constellation-impact]
Symbol: validateUser (function)
Risk Level: MEDIUM
Files Affected: 12
Symbols Affected: 34
Test Coverage: 67%

Recommendations:
- Update unit tests in auth.spec.ts
- Check integration with UserController
```

### Find Dead Code

```
> Find unused functions

[skill: constellation-unused]
Found 7 orphaned functions:
├── src/utils/legacy.ts
│   ├── formatLegacyDate (line 23)
│   └── parseLegacyConfig (line 45)
├── src/helpers/deprecated.ts
│   └── oldValidation (line 12)
...
```

### Understand Dependencies

```
> Show me the dependencies for src/services/payment.service.ts

[skill: constellation-deps]
Dependencies (12):
├── Internal (8)
│   ├── src/models/payment.model.ts
│   ├── src/utils/currency.ts
│   └── ...
└── External (4)
    ├── stripe
    ├── lodash
    └── ...

No circular dependencies detected.
```

### Available Skills

| Skill | Triggers on |
|-------|-------------|
| `constellation-status` | "Is Constellation working?", "ping Constellation" |
| `constellation-diagnose` | "Full Constellation health check" |
| `constellation-impact` | "What would break if I change X?", "blast radius of X" |
| `constellation-deps` | "Dependencies of X", "what depends on X" |
| `constellation-unused` | "Find dead code", "orphaned exports" |
| `constellation-architecture` | "Codebase overview", "architecture summary" |
| `constellation-troubleshooting` | Any Constellation error code or "Constellation broken" |

### How It Works

Constellation uses privacy-preserving AST extraction to understand your code structure without transmitting source code:

```
Your Code → AST Extraction → Constellation API → Code Intelligence
              (no source)      (encrypted)        (semantic queries)
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `AUTH_ERROR` | Check `CONSTELLATION_ACCESS_KEY` is set correctly, use `constellation auth` CLI command to set |
| `PROJECT_NOT_INDEXED` | Run `constellation index --full` in your project |
| MCP Server not responding | Restart OpenCode, or ask "Run a Constellation health check" to invoke the `constellation-diagnose` skill |

## Documentation

- [Constellation Documentation](https://docs.constellationdev.io) — Full platform documentation
- [OpenCode Documentation](https://opencode.ai/docs) — OpenCode plugin development guide
- [MCP Server](https://github.com/shiftinbits/constellation-mcp) — Underlying MCP server

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

Copyright © 2026 ShiftinBits Inc.

See [LICENSE](LICENSE) file for details.
