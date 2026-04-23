# <img src="https://constellationdev.io/opencode-icon.svg" height="30"> Constellation Plugin for OpenCode

[![NPM Version](https://img.shields.io/npm/v/@constellationdev/opencode?logo=npm&logoColor=white)](https://www.npmjs.com/package/@constellationdev/opencode) [![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-3DA639?logo=opensourceinitiative&logoColor=white)](LICENSE)

While Constellation's MCP server provides raw code intelligence capabilities, this plugin enhances your OpenCode experience with:

| Feature | Benefit |
|---------|---------|
| **Slash Commands** | Quick access to common workflows |
| **Specialized Agents** | AI agents for codebase exploration, impact analysis, and dependency health |
| **Session Hooks** | Automatic Constellation availability checks and context preservation |

## Features

### Commands

Execute powerful analysis with simple slash commands:

| Command | Description |
|---------|-------------|
| `/constellation/status` | Check API connectivity and project indexing status |
| `/constellation/diagnose` | Full health check with project stats |
| `/constellation/impact <symbol> [file]` | Analyze blast radius before changing a symbol |
| `/constellation/deps <file> [--reverse]` | Map dependencies or find what depends on a file |
| `/constellation/unused [kind]` | Discover orphaned exports and dead code |
| `/constellation/architecture` | Get a high-level overview of your codebase structure |
| `/constellation/troubleshoot [error]` | Diagnose Constellation issues with error code reference |

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

### Check Your Setup

```
> /constellation/status

Status: Connected
Project: my-awesome-app
Files Indexed: 1,247
Symbols: 8,932
Languages: TypeScript, JavaScript
```

### Analyze Before Refactoring

```
> /constellation/impact validateUser src/auth/validator.ts

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
> /constellation/unused function

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
> /constellation/deps src/services/payment.service.ts

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
| MCP Server not responding | Restart OpenCode or run `/constellation/diagnose` to check connectivity |

## Documentation

- [Constellation Documentation](https://docs.constellationdev.io) — Full platform documentation
- [OpenCode Documentation](https://opencode.ai/docs) — OpenCode plugin development guide
- [MCP Server](https://github.com/shiftinbits/constellation-mcp) — Underlying MCP server

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

Copyright © 2026 ShiftinBits Inc.

See [LICENSE](LICENSE) file for details.
